import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectIdea, User, Notification } from '../types';
import { generateMockProjects } from '../utils/mockData';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

interface ProjectContextType {
  projects: ProjectIdea[];
  notifications: Notification[];
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => void;
  upvoteProject: (id: string) => void;
  saveProject: (id: string) => void;
  searchProjects: (query: string, filters: any) => ProjectIdea[];
  getProjectById: (id: string) => ProjectIdea | undefined;
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
        savedProjects: [],
        postedProjects: []
      });
    }

    setProjects(generateMockProjects());
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
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // First, sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Then, create a profile in our profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            name,
            avatar_url: null
          }
        ]);

      if (profileError) {
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut();
        throw profileError;
      }

      // Set the current user
      setCurrentUser({
        id: authData.user.id,
        name,
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
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
        project.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        filters.difficulty.includes(project.difficulty)
      );
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        project.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    return filteredProjects;
  };

  const getProjectById = (id: string): ProjectIdea | undefined => {
    return projects.find(project => project.id === id);
  };

  return (
    <ProjectContext.Provider 
      value={{ 
        projects, 
        notifications,
        addProject, 
        upvoteProject, 
        saveProject,
        searchProjects,
        getProjectById,
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