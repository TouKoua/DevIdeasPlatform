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
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'views' | 'createdBy'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Pick<ProjectIdea, 'title' | 'description' | 'difficulty' | 'programmingLanguages' | 'programmingSkills' | 'estimatedTime' | 'maxContributors' | 'showContributorCount' | 'status' | 'showStatus'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateUserProfile: (updates: Partial<Pick<User, 'name' | 'bio' | 'location' | 'website' | 'github' | 'twitter' | 'avatar'>>) => Promise<void>;
  incrementProjectViews: (id: string) => Promise<void>;
  saveProject: (id: string) => void;
  searchProjects: (query: string, filters: any) => ProjectIdea[];
  getProjectById: (id: string) => ProjectIdea | undefined;
  getUserById: (id: string) => Promise<User | undefined>;
  getProjectsByUserId: (userId: string) => ProjectIdea[];
  createContributionRequest: (projectId: string, message?: string) => Promise<void>;
  updateContributionRequestStatus: (requestId: string, status: 'accepted' | 'declined' | 'removed', responseMessage?: string) => Promise<void>;
  getContributionRequestsForProject: (projectId: string) => Promise<ContributionRequest[]>;
  getContributionRequestsByUser: (userId: string) => ContributionRequest[];
  fetchContributionRequestsForProject: (projectId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [contributionRequests, setContributionRequests] = useState<Map<string, ContributionRequest[]>>(new Map());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewedProjects, setViewedProjects] = useState<Set<string>>(new Set());

  // Load viewed projects from localStorage on mount
  useEffect(() => {
    const storedViewedProjects = localStorage.getItem('viewedProjects');
    if (storedViewedProjects) {
      try {
        const parsed = JSON.parse(storedViewedProjects);
        setViewedProjects(new Set(parsed));
      } catch (error) {
        console.error('Error parsing viewed projects from localStorage:', error);
      }
    }
  }, []);

  // Save viewed projects to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('viewedProjects', JSON.stringify(Array.from(viewedProjects)));
  }, [viewedProjects]);

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      const { data: notificationsData, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      const transformedNotifications: Notification[] = notificationsData.map((notification: any) => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        readStatus: notification.read_status,
        notificationType: notification.notification_type,
        relatedProjectId: notification.related_project_id,
        relatedUserId: notification.related_user_id,
        linkUrl: notification.link_url,
        createdAt: new Date(notification.created_at)
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  };

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('user_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Real-time notification update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification: Notification = {
              id: payload.new.id,
              userId: payload.new.user_id,
              title: payload.new.title,
              message: payload.new.message,
              readStatus: payload.new.read_status,
              notificationType: payload.new.notification_type,
              relatedProjectId: payload.new.related_project_id,
              relatedUserId: payload.new.related_user_id,
              linkUrl: payload.new.link_url,
              createdAt: new Date(payload.new.created_at)
            };
            
            setNotifications(prev => [newNotification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === payload.new.id
                  ? {
                      ...notification,
                      readStatus: payload.new.read_status,
                      title: payload.new.title,
                      message: payload.new.message
                    }
                  : notification
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with creator profiles, tags, and user websites
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

      // Fetch user websites for all project creators
      const creatorIds = projectsData.map((project: any) => project.profiles.id);
      const { data: userWebsitesData, error: websitesError } = await supabase
        .from('user_websites')
        .select('*')
        .in('id', creatorIds);

      if (websitesError) {
        console.error('Error fetching user websites:', websitesError);
      }

      // Create a map of user websites for quick lookup
      const userWebsitesMap = new Map();
      if (userWebsitesData) {
        userWebsitesData.forEach((website: any) => {
          userWebsitesMap.set(website.id, website);
        });
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

        // Get user websites data for this creator
        const userWebsite = userWebsitesMap.get(project.profiles.id);

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          difficulty: project.difficulty as 'beginner' | 'intermediate' | 'advanced',
          programmingLanguages,
          programmingSkills,
          estimatedTime: project.estimated_time,
          maxContributors: project.max_contributors,
          currentContributors: project.current_contributors || 0,
          showContributorCount: project.show_contributor_count !== false, // Default to true if null
          status: project.status as 'recruiting' | 'working' | 'completed' | undefined,
          showStatus: project.show_status !== false, // Default to true if null
          createdAt: new Date(project.created_at),
          updatedAt: project.updated_at ? new Date(project.updated_at) : undefined,
          createdBy: {
            id: project.profiles.id,
            name: project.profiles.name,
            avatar: project.profiles.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256'
          },
          views: project.views_count || Math.floor(Math.random() * 500) + 10, // Use database views or fallback to random
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

  // Fetch contribution requests for a specific project
  const fetchContributionRequestsForProject = async (projectId: string) => {
    try {
      const { data: requestsData, error: requestsError } = await supabase
        .from('contribution_requests')
        .select(`
          *,
          profiles!contribution_requests_requester_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error fetching contribution requests:', requestsError);
        return;
      }

      // Transform the data to match our ContributionRequest interface
      const transformedRequests: ContributionRequest[] = requestsData.map((request: any) => ({
        id: request.id,
        projectId: request.project_id,
        requesterId: request.requester_id,
        message: request.message,
        status: request.status as 'pending' | 'accepted' | 'declined',
        createdAt: new Date(request.created_at),
        updatedAt: new Date(request.updated_at),
        responseMessage: request.response_message,
        // Populated fields
        requester: {
          id: request.profiles.id,
          name: request.profiles.name,
          avatar: request.profiles.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
          joinedDate: new Date(), // We don't have this data in the query, so use current date
          savedProjects: [],
          postedProjects: []
        }
      }));

      // Update the contribution requests map for this project
      setContributionRequests(prev => {
        const newMap = new Map(prev);
        newMap.set(projectId, transformedRequests);
        return newMap;
      });

    } catch (error) {
      console.error('Error in fetchContributionRequestsForProject:', error);
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
        // Fetch user profile with websites
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profileError && profile) {
          // Fetch user websites
          const { data: userWebsite, error: websiteError } = await supabase
            .from('user_websites')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (websiteError && websiteError.code !== 'PGRST116') {
            console.error('Error fetching user website:', websiteError);
          }

          // Extract social links from URLs
          const extractUsernameFromUrl = (url: string | null, platform: string): string | undefined => {
            if (!url) return undefined;
            
            try {
              const urlObj = new URL(url);
              const pathname = urlObj.pathname;
              
              if (platform === 'github' && urlObj.hostname === 'github.com') {
                return pathname.split('/')[1] || undefined;
              } else if (platform === 'twitter' && (urlObj.hostname === 'twitter.com' || urlObj.hostname === 'x.com')) {
                return pathname.split('/')[1] || undefined;
              }
              
              return url; // Return full URL if not a recognized pattern
            } catch {
              return url; // Return as-is if not a valid URL
            }
          };

          setCurrentUser({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
            bio: profile.bio,
            location: profile.location,
            website: userWebsite?.website_url,
            github: extractUsernameFromUrl(userWebsite?.github_url, 'github'),
            twitter: extractUsernameFromUrl(userWebsite?.twitter_url, 'twitter'),
            joinedDate: new Date(profile.created_at),
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
    };

    initializeData();
  }, []);

  // Fetch notifications when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const markNotificationAsRead = async (id: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_status: true })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, readStatus: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error in markNotificationAsRead:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read_status: true })
        .eq('user_id', currentUser.id)
        .eq('read_status', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, readStatus: true }))
      );
    } catch (error) {
      console.error('Error in markAllNotificationsAsRead:', error);
    }
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

      // Fetch user websites
      const { data: userWebsite, error: websiteError } = await supabase
        .from('user_websites')
        .select('*')
        .eq('id', profile.id)
        .single();

      if (websiteError && websiteError.code !== 'PGRST116') {
        console.error('Error fetching user website:', websiteError);
      }

      // Extract social links from URLs
      const extractUsernameFromUrl = (url: string | null, platform: string): string | undefined => {
        if (!url) return undefined;
        
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          
          if (platform === 'github' && urlObj.hostname === 'github.com') {
            return pathname.split('/')[1] || undefined;
          } else if (platform === 'twitter' && (urlObj.hostname === 'twitter.com' || urlObj.hostname === 'x.com')) {
            return pathname.split('/')[1] || undefined;
          }
          
          return url; // Return full URL if not a recognized pattern
        } catch {
          return url; // Return as-is if not a valid URL
        }
      };

      setCurrentUser({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        bio: profile.bio,
        location: profile.location,
        website: userWebsite?.website_url,
        github: extractUsernameFromUrl(userWebsite?.github_url, 'github'),
        twitter: extractUsernameFromUrl(userWebsite?.twitter_url, 'twitter'),
        joinedDate: new Date(profile.created_at),
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
        joinedDate: new Date(),
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
    setNotifications([]);
    // Clear viewed projects on logout
    setViewedProjects(new Set());
    localStorage.removeItem('viewedProjects');
    // Clear contribution requests cache
    setContributionRequests(new Map());
    // Refresh projects after logout to remove user-specific data
    await fetchProjects();
  };

  const updateUserProfile = async (updates: Partial<Pick<User, 'name' | 'bio' | 'location' | 'website' | 'github' | 'twitter' | 'avatar'>>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update profile');
    }

    try {
      // Update the profile in Supabase (excluding social links)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
          bio: updates.bio,
          location: updates.location,
          avatar_url: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error('Failed to update profile');
      }

      // Update or insert user websites data
      const websiteData: any = {
        id: currentUser.id,
        website_name: 'Personal Website'
      };

      // Add URLs, converting usernames to full URLs where needed
      if (updates.website) {
        websiteData.website_url = updates.website.startsWith('http') ? updates.website : `https://${updates.website}`;
      }

      if (updates.github) {
        websiteData.github_url = updates.github.startsWith('http') ? updates.github : `https://github.com/${updates.github}`;
      }

      if (updates.twitter) {
        websiteData.twitter_url = updates.twitter.startsWith('http') ? updates.twitter : `https://twitter.com/${updates.twitter}`;
      }

      // Only update user_websites if we have social link data
      if (updates.website || updates.github || updates.twitter) {
        const { error: websiteError } = await supabase
          .from('user_websites')
          .upsert(websiteData, {
            onConflict: 'id'
          });

        if (websiteError) {
          console.error('Error updating user websites:', websiteError);
          throw new Error('Failed to update social links');
        }
      }

      // Update the current user state
      setCurrentUser(prev => prev ? {
        ...prev,
        name: updates.name || prev.name,
        bio: updates.bio || prev.bio,
        location: updates.location || prev.location,
        website: updates.website || prev.website,
        github: updates.github || prev.github,
        twitter: updates.twitter || prev.twitter,
        avatar: updates.avatar || prev.avatar
      } : null);

      // Refresh projects to update the creator information
      await fetchProjects();

    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      throw error;
    }
  };

  const addProject = async (projectData: Omit<ProjectIdea, 'id' | 'createdAt' | 'views' | 'createdBy'>): Promise<string> => {
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
          max_contributors: projectData.maxContributors || null,
          show_contributor_count: projectData.showContributorCount !== false, // Default to true
          status: projectData.status || 'recruiting', // Default to recruiting
          show_status: projectData.showStatus !== false, // Default to true
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

      return newProjectId;

    } catch (error) {
      console.error('Error in addProject:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Pick<ProjectIdea, 'title' | 'description' | 'difficulty' | 'programmingLanguages' | 'programmingSkills' | 'estimatedTime' | 'maxContributors' | 'showContributorCount' | 'status' | 'showStatus'>>) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update a project');
    }

    try {
      // Update the main project - remove the manual updated_at setting since the trigger will handle it
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          description: updates.description,
          difficulty: updates.difficulty,
          estimated_time: updates.estimatedTime || null,
          max_contributors: updates.maxContributors || null,
          show_contributor_count: updates.showContributorCount !== false, // Default to true
          status: updates.status,
          show_status: updates.showStatus !== false // Default to true
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

  const deleteProject = async (id: string) => {
    if (!currentUser) {
      throw new Error('Must be logged in to delete a project');
    }

    try {
      // Delete the project (this will cascade delete related records due to foreign key constraints)
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('created_by', currentUser.id); // Ensure user can only delete their own projects

      if (deleteError) {
        console.error('Error deleting project:', deleteError);
        throw new Error('Failed to delete project');
      }

      // Remove the project from local state immediately for better UX
      setProjects(prev => prev.filter(project => project.id !== id));

      // Also remove any related contribution requests from local state
      setContributionRequests(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });

    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  };

  const incrementProjectViews = async (id: string) => {
    if(!currentUser){
      return;
    }
    // Check if this project has already been viewed by this user/session
    if (viewedProjects.has(id)) {
      return; // Don't increment if already viewed
    }

    // Mark this project as viewed locally immediately to prevent repeated API calls
    setViewedProjects(prev => new Set([...prev, id]));

    try {
      // Track the view in Supabase
      const { error } = await supabase
        .from('project_views')
        .insert({
          project_id: id,
          user_id: currentUser?.id || null
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate key error - view already exists in database, this is expected
          // Don't log as error and don't increment local count
          return;
        } else {
          // Other Supabase errors should be logged
          console.error('Error tracking project view:', error);
          return;
        }
      }

      // Only increment local view count if the insert was successful (no error)
      setProjects(prev => 
        prev.map(project => 
          project.id === id 
            ? { ...project, views: project.views + 1 } 
            : project
        )
      );

    } catch (error) {
      // Log unexpected client-side errors
      console.error('Error in incrementProjectViews:', error);
    }
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

  const getUserById = async (id: string): Promise<User | undefined> => {
    try {
      // First check if it's the current user
      if (currentUser && currentUser.id === id) {
        return currentUser;
      }

      // Try to fetch from Supabase database
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && profile) {
        // Fetch user websites
        const { data: userWebsite, error: websiteError } = await supabase
          .from('user_websites')
          .select('*')
          .eq('id', id)
          .single();

        if (websiteError && websiteError.code !== 'PGRST116') {
          console.error('Error fetching user website:', websiteError);
        }

        // Extract social links from URLs
        const extractUsernameFromUrl = (url: string | null, platform: string): string | undefined => {
          if (!url) return undefined;
          
          try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            
            if (platform === 'github' && urlObj.hostname === 'github.com') {
              return pathname.split('/')[1] || undefined;
            } else if (platform === 'twitter' && (urlObj.hostname === 'twitter.com' || urlObj.hostname === 'x.com')) {
              return pathname.split('/')[1] || undefined;
            }
            
            return url; // Return full URL if not a recognized pattern
          } catch {
            return url; // Return as-is if not a valid URL
          }
        };

        return {
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar_url || 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
          bio: profile.bio,
          location: profile.location,
          website: userWebsite?.website_url,
          github: extractUsernameFromUrl(userWebsite?.github_url, 'github'),
          twitter: extractUsernameFromUrl(userWebsite?.twitter_url, 'twitter'),
          joinedDate: new Date(profile.created_at),
          savedProjects: [],
          postedProjects: []
        };
      }

      // Fallback to mock users for demo purposes
      return users.find(user => user.id === id);
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      // Fallback to mock users
      return users.find(user => user.id === id);
    }
  };

  const getProjectsByUserId = (userId: string): ProjectIdea[] => {
    return projects.filter(project => project.createdBy.id === userId);
  };

  const createContributionRequest = async (projectId: string, message?: string) => {
    if (!currentUser) throw new Error('Must be logged in to create contribution request');
    
    const project = getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    try {
      // Call the Edge Function to send email notification and save to database
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-contribution`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          projectTitle: project.title,
          projectCreatorId: project.createdBy.id,
          projectCreatorName: project.createdBy.name,
          requesterId: currentUser.id,
          requesterName: currentUser.name,
          projectUrl: `${window.location.origin}/project/${project.id}`,
          message: message
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send contribution request');
      }

      // Refresh contribution requests for this project to get the latest data
      await fetchContributionRequestsForProject(projectId);

    } catch (error) {
      console.error('Error creating contribution request:', error);
      throw error;
    }
  };

  const updateContributionRequestStatus = async (requestId: string, status: 'accepted' | 'declined' | 'removed', responseMessage?: string) => {
    if (!currentUser) {
      throw new Error('Must be logged in to update contribution request status');
    }

    try {
      // If status is 'removed', we actually set it to 'declined' in the database
      // since the database schema doesn't support 'removed' status
      const dbStatus = status === 'removed' ? 'declined' : status;
      
      // Update the contribution request status in the database
      const { error: updateError } = await supabase
        .from('contribution_requests')
        .update({
          status: dbStatus,
          response_message: responseMessage || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating contribution request status:', updateError);
        throw new Error('Failed to update contribution request status');
      }

      // Update local state for all projects that might have this request
      setContributionRequests(prev => {
        const newMap = new Map(prev);
        for (const [projectId, requests] of newMap.entries()) {
          const updatedRequests = requests.map(request =>
            request.id === requestId
              ? { ...request, status, responseMessage, updatedAt: new Date() }
              : request
          );
          newMap.set(projectId, updatedRequests);
        }
        return newMap;
      });

      // Refresh projects to get the updated contributor count from the database
      // The database trigger will have updated the current_contributors count
      await refreshProjects();

    } catch (error) {
      console.error('Error in updateContributionRequestStatus:', error);
      throw error;
    }
  };

  const getContributionRequestsForProject = async (projectId: string): Promise<ContributionRequest[]> => {
    const requests = contributionRequests.get(projectId) || [];
    
    // Populate requester data asynchronously
    const populatedRequests = await Promise.all(
      requests.map(async (request) => ({
        ...request,
        project: getProjectById(request.projectId),
        requester: (await getUserById(request.requesterId)) || request.requester
      }))
    );
    
    return populatedRequests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getContributionRequestsByUser = (userId: string): ContributionRequest[] => {
    const allRequests: ContributionRequest[] = [];
    
    // Collect all requests from all projects
    for (const requests of contributionRequests.values()) {
      allRequests.push(...requests.filter(request => request.requesterId === userId));
    }
    
    return allRequests
      .map(request => ({
        ...request,
        project: getProjectById(request.projectId),
        requester: users.find(user => user.id === request.requesterId)
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projects,
        users,
        notifications,
        contributionRequests: [], // This is now handled by the map, but we keep it for backward compatibility
        loading,
        addProject,
        updateProject,
        deleteProject,
        updateUserProfile,
        incrementProjectViews, 
        saveProject,
        searchProjects,
        getProjectById,
        getUserById,
        getProjectsByUserId,
        createContributionRequest,
        updateContributionRequestStatus,
        getContributionRequestsForProject,
        getContributionRequestsByUser,
        fetchContributionRequestsForProject,
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