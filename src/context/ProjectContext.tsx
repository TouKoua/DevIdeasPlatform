import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectIdea, User } from '../types';
import { generateMockProjects } from '../utils/mockData';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please click "Connect to Supabase" button to set up your project.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ProjectContextType {
  projects: ProjectIdea[];
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => void;
  upvoteProject: (id: string) => void;
  saveProject: (id: string) => void;
  searchProjects: (query: string, filters: any) => ProjectIdea[];
  getProjectById: (id: string) => ProjectIdea | undefined;
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Check for existing session
    const session = supabase.auth.getSession();
    if (session) {
      // Get user profile data
      // For now, we'll use mock data
      setCurrentUser({
        id: 'user1',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        savedProjects: [],
        postedProjects: []
      });
    }

    // Initialize with mock data
    setProjects(generateMockProjects());
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;

      // For now, set mock user data
      setCurrentUser({
        id: 'user1',
        name: 'Sarah Chen',
        avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
        savedProjects: [],
        postedProjects: []
      });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });
      
      if (error) throw error;

      // For now, set mock user data
      setCurrentUser({
        id: 'user1',
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
          ? { ...project, upvotes: project.upvotes + 1 } 
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
        addProject, 
        upvoteProject, 
        saveProject,
        searchProjects,
        getProjectById,
        currentUser,
        login,
        signup,
        logout
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};