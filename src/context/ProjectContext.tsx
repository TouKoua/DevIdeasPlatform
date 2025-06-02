import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectIdea, User } from '../types';
import { generateMockProjects } from '../utils/mockData';

interface ProjectContextType {
  projects: ProjectIdea[];
  addProject: (project: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => void;
  upvoteProject: (id: string) => void;
  saveProject: (id: string) => void;
  searchProjects: (query: string, filters: any) => ProjectIdea[];
  getProjectById: (id: string) => ProjectIdea | undefined;
  currentUser: User;
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
  
  // Mock current user for demo
  const [currentUser] = useState<User>({
    id: 'user1',
    name: 'Sarah Chen',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=256',
    savedProjects: [],
    postedProjects: []
  });

  useEffect(() => {
    // Initialize with mock data
    setProjects(generateMockProjects());
  }, []);

  const addProject = (projectData: Omit<ProjectIdea, 'id' | 'createdAt' | 'upvotes'>) => {
    const newProject: ProjectIdea = {
      ...projectData,
      id: `project-${Date.now()}`,
      createdAt: new Date(),
      upvotes: 0,
    };
    
    setProjects(prev => [newProject, ...prev]);
    
    // Update user's posted projects
    const updatedUser = {
      ...currentUser,
      postedProjects: [...currentUser.postedProjects, newProject.id]
    };
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
    // Toggle saved status for UI
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
    
    // Filter by search query
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      filteredProjects = filteredProjects.filter(project => 
        project.title.toLowerCase().includes(lowercasedQuery) || 
        project.description.toLowerCase().includes(lowercasedQuery) ||
        project.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery))
      );
    }
    
    // Filter by difficulty
    if (filters.difficulty && filters.difficulty.length > 0) {
      filteredProjects = filteredProjects.filter(project => 
        filters.difficulty.includes(project.difficulty)
      );
    }
    
    // Filter by tags
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
        currentUser
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};