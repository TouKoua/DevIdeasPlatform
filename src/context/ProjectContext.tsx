import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectIdea, User, Notification, ContributionRequest } from '../types';
import { generateMockUsers } from '../utils/mockData';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface ProjectContextType {
  projects: ProjectIdea[];
  users: User[];
  notifications: Notification[];
  contributionRequests: ContributionRequest[];
  loading: boolean;
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes' | 'createdBy'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Pick<ProjectIdea, 'title' | 'description' | 'difficulty' | 'programmingLanguages' | 'programmingSkills' | 'estimatedTime'>>) => Promise<void>;
  upvoteProject: (id: string) => void;
  saveProject: (id: string) => void;
  searchProjects: (query: string, filters: any) => ProjectIdea[];
  getProjectById: (id: string) => ProjectIdea | undefined;
  getUserById: (id: string) => User | undefined;
  getProjectsByUserId: (userId: string) => ProjectIdea[];
  createContributionRequest: (projectId: string, message?: string) => Promise<void>;
  updateContributionRequestStatus: (requestId: string, status: 'accepted' | 'declined', responseMessage?: string) => Promise<void>;
  getContributionRequestsForProject: (projectId: string) => ContributionRequest[];
  getContributionRequestsByUser: (userId: string) => ContributionRequest[];
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  markNotificationAsRead: (id: number) => void;
  markAllNotificationsAsRead: () => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contributionRequests, setContributionRequests] = useState<ContributionRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New upvote on your project',
      message: 'Alex Johnson upvoted your Weather Dashboard project',
      time: '5m ago',
      unread: true,
      projectId: 'project-1',
      type: 'upvote'
    },
    {
      id: 2,
      title: 'Project recommendation',
      message: 'Check out this new project that matches your interests',
      time: '1h ago',
      unread: true,
      projectId: 'project-3',
      type: 'recommendation'
    },
    {
      id: 3,
      title: 'Welcome to CodeIdeas',
      message: 'Start exploring project ideas or share your own',
      time: '2d ago',
      unread: false,
      type: 'welcome'
    }
  ]);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with creator profiles and tags
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          profiles!projects_created_by_fkey (
            id,
            name,
            avatar_url
          ),
          project_tags (
            tag
          )
        `)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return;
      }

      // Transform the data to match our ProjectIdea interface
      const transformedProjects: ProjectIdea[] = projectsData.map((project: any) => {
        // Separate tags into programming languages and skills
        const allTags = project.project_tags?.map((pt: any) => pt.tag) || [];
        
        // Common programming languages for filtering
        const commonLanguages = [
          'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
          'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
          'HTML', 'CSS', 'SQL', 'Shell', 'PowerShell', 'Lua', 'Perl', 'Haskell'
        ];
        
        const programmingLanguages = allTags.filter((tag: string) => 
          commonLanguages.includes(tag)
        );
        
        const programmingSkills = allTags.filter((tag: string) => 
          !commonLanguages.includes(tag)
        );

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          difficulty: project.difficulty as 'beginner' | 'intermediate' | 'advanced',
          programmingLanguages,
          programmingSkills,
          estimatedTime: project.estimated_time,
          createdAt: new Date(project.created_at),
          updatedAt: project.updated_at ? new Date(project.updated_at) : undefined,
          createdBy: {
            id: project.profiles.id,
            name: project.profiles.name,
            avatar: project.profiles.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256'
          },
          upvotes: 0, // TODO: Implement upvotes system
          upvoted: false, // TODO: Check if current user has upvoted
          saved: false // TODO: Check if current user has saved
        };
      });

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error in fetchProjects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh projects function
  const refreshProjects = async () => {
    await fetchProjects();
  };

  useEffect(() => {
    const initializeData = async () => {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          setCurrentUser({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
            savedProjects: [],
            postedProjects: []
          });
        }
      }

      // Initialize mock users (for demo purposes)
      const mockUsers = generateMockUsers();
      setUsers(mockUsers);
      
      // Fetch projects from Supabase
      await fetchProjects();
      
      // Generate some mock contribution requests
      setContributionRequests([
        {
          id: 'req-1',
          projectId: 'project-1',
          requesterId: 'user3',
          message: 'I have experience with React and weather APIs. Would love to contribute to this project!',
          status: 'pending',
          createdAt: new Date('2023-11-15'),
          updatedAt: new Date('2023-11-15')
        },
        {
          id: 'req-2',
          projectId: 'project-1',
          requesterId: 'user4',
          message: 'This looks like a great project. I can help with the backend API integration.',
          status: 'pending',
          createdAt: new Date('2023-11-14'),
          updatedAt: new Date('2023-11-14')
        },
        {
          id: 'req-3',
          projectId: 'project-2',
          requesterId: 'user1',
          message: 'I love CLI tools and have built several in Python. Happy to collaborate!',
          status: 'accepted',
          createdAt: new Date('2023-11-10'),
          updatedAt: new Date('2023-11-12'),
          responseMessage: 'Great! I\'d love to have your help. Let me know your GitHub username and I\'ll add you as a collaborator.'
        }
      ]);
    };

    initializeData();
  }, []);

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // Fetch user profile after successful login
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      setCurrentUser({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        savedProjects: [],
        postedProjects: []
      });

      // Refresh projects after login to get user-specific data
      await fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Set the current user
      setCurrentUser({
        id: authData.user.id,
        name: authData.user.user_metadata.name,
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        savedProjects: [],
        postedProjects: []
      });

      // Refresh projects after signup
      await fetchProjects();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    // Refresh projects after logout to remove user-specific data
    await fetchProjects();
  };

  const addProject = async (projectData: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes' | 'createdBy'>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to create a project');
    }

    try {
      // Insert the main project into the projects table
      const { data: projectInsertData, error: projectError } = await supabase
        .from('projects')
        .insert({
          title: projectData.title,
          description: projectData.description,
          difficulty: projectData.difficulty,
          estimated_time: projectData.estimatedTime || null,
          created_by: currentUser.id
        })
        .select()
        .single();

      if (projectError) {
        console.error('Error inserting project:', projectError);
        throw new Error('Failed to create project');
      }

      const newProjectId = projectInsertData.id;

      // Combine programming languages and skills into tags
      const allTags = [
        ...projectData.programmingLanguages,
        ...projectData.programmingSkills
      ];

      // Insert tags into project_tags table
      if (allTags.length > 0) {
        const tagInserts = allTags.map(tag => ({
          project_id: newProjectId,
          tag: tag
        }));

        const { error: tagsError } = await supabase
          .from('project_tags')
          .insert(tagInserts);

        if (tagsError) {
          console.error('Error inserting project tags:', tagsError);
          // Note: We don't throw here as the project was created successfully
          // The tags can be added later if needed
        }
      }

      // Refresh projects to get the latest data from the database
      await fetchProjects();

    } catch (error) {
      console.error('Error in addProject:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<ProjectIdea, 'title' | 'description' | 'difficulty' | 'programmingLanguages' | 'programmingSkills' | 'estimatedTime'>>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update a project');
    }

    try {
      // Update the main project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          difficulty: updates.difficulty,
          estimated_time: updates.estimatedTime || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', currentUser.id); // Ensure user can only update their own projects

      if (projectError) {
        console.error('Error updating project:', projectError);
        throw new Error('Failed to update project');
      }

      // Update tags if provided
      if (updates.programmingLanguages || updates.programmingSkills) {
        // Delete existing tags
        const { error: deleteError } = await supabase
          .from('project_tags')
          .delete()
          .eq('project_id', id);

        if (deleteError) {
          console.error('Error deleting old tags:', deleteError);
        }

        // Insert new tags
        const allTags = [
          ...(updates.programmingLanguages || []),
          ...(updates.programmingSkills || [])
        ];

        if (allTags.length > 0) {
          const tagInserts = allTags.map(tag => ({
            project_id: id,
            tag: tag
          }));

          const { error: tagsError } = await supabase
            .from('project_tags')
            .insert(tagInserts);

          if (tagsError) {
            console.error('Error inserting updated tags:', tagsError);
          }
        }
      }

      // Refresh projects to get the latest data
      await fetchProjects();

    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  };

  const upvoteProject = (id: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { 
              ...project, 
              upvotes: project.upvoted ? project.upvotes - 1 : project.upvotes + 1,
              upvoted: !project.upvoted 
            } 
          : project
      )
    );
  };

  const saveProject = (id: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, saved: !project.saved } 
          : project
      )
    );
  };

  const searchProjects = (query: string, filters: any): ProjectIdea[] => {
    let filteredProjects = [...projects];
    
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        project.title.toLowerCase().includes(lowercasedQuery) || 
        project.description.toLowerCase().includes(lowercasedQuery) ||
        project.programmingLanguages.some(lang => lang.toLowerCase().includes(lowercasedQuery)) ||
        project.programmingSkills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        filters.difficulty.includes(project.difficulty)
      );
    }
    
    if (filters.programmingLanguages && filters.programmingLanguages.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        project.programmingLanguages.some(lang => filters.programmingLanguages.includes(lang))
      );
    }

    if (filters.programmingSkills && filters.programmingSkills.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        project.programmingSkills.some(skill => filters.programmingSkills.includes(skill))
      );
    }
    
    return filteredProjects;
  };

  const getProjectById = (id: string): ProjectIdea | undefined => {
    return projects.find(project => project.id === id);
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getProjectsByUserId = (userId: string): ProjectIdea[] => {
    return projects.filter(project => project.createdBy.id === userId);
  };

  const createContributionRequest = async (projectId: string, message?: string) => {
    if (!currentUser) throw new Error('Must be logged in to create contribution request');
    
    const newRequest: ContributionRequest = {
      id: `req-${Date.now()}`,
      projectId,
      requesterId: currentUser.id,
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setContributionRequests(prev => [newRequest, ...prev]);
  };

  const updateContributionRequestStatus = async (requestId: string, status: 'accepted' | 'declined', responseMessage?: string) => {
    setContributionRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status, responseMessage, updatedAt: new Date() }
          : request
      )
    );
  };

  const getContributionRequestsForProject = (projectId: string): ContributionRequest[] => {
    return contributionRequests
      .filter(request => request.projectId === projectId)
      .map(request => ({
        ...request,
        project: getProjectById(request.projectId),
        requester: getUserById(request.requesterId)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getContributionRequestsByUser = (userId: string): ContributionRequest[] => {
    return contributionRequests
      .filter(request => request.requesterId === userId)
      .map(request => ({
        ...request,
        project: getProjectById(request.projectId),
        requester: getUserById(request.requesterId)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projects,
        users,
        notifications,
        contributionRequests,
        loading,
        addProject,
        updateProject,
        upvoteProject, 
        saveProject,
        searchProjects,
        getProjectById,
        getUserById,
        getProjectsByUserId,
        createContributionRequest,
        updateContributionRequestStatus,
        getContributionRequestsForProject,
        getContributionRequestsByUser,
        currentUser,
        login,
        signup,
        logout,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        refreshProjects
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};