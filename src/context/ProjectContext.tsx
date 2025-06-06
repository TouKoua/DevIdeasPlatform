import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectIdea, User, Notification, ContributionRequest } from '../types';
import { generateMockProjects, generateMockUsers } from '../utils/mockData';
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
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => void;
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

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      setCurrentUser({
        id: 'user1',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        bio: 'Full-stack developer passionate about creating innovative web applications. Love working with React, Node.js, and exploring new technologies.',
        location: 'San Francisco, CA',
        joinedDate: new Date('2023-01-15'),
        website: 'https://sarahchen.dev',
        github: 'sarahchen',
        twitter: 'sarahchen_dev',
        savedProjects: [],
        postedProjects: []
      });
    }

    const mockUsers = generateMockUsers();
    setUsers(mockUsers);
    setProjects(generateMockProjects());
    
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

      setCurrentUser({
        id: 'user1',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        bio: 'Full-stack developer passionate about creating innovative web applications. Love working with React, Node.js, and exploring new technologies.',
        location: 'San Francisco, CA',
        joinedDate: new Date('2023-01-15'),
        website: 'https://sarahchen.dev',
        github: 'sarahchen',
        twitter: 'sarahchen_dev',
        savedProjects: [],
        postedProjects: []
      });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            password: '**********'
          }
        ]);

      if (profileError) {
        await supabase.auth.signOut();
        throw profileError;
      }

      setCurrentUser({
        id: authData.user.id,
        name,
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        bio: '',
        location: '',
        joinedDate: new Date(),
        savedProjects: [],
        postedProjects: []
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const addProject = (projectData: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => {
    const newProject: ProjectIdea = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      upvotes: 0,
    };
    
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = async (id: string, updates: Partial<Pick<ProjectIdea, 'title' | 'description' | 'difficulty' | 'programmingLanguages' | 'programmingSkills' | 'estimatedTime'>>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );
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
        markAllNotificationsAsRead
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};