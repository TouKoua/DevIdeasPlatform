export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    avatar: string;
  };
  upvotes: number;
  estimatedTime?: string;
  saved?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  savedProjects: string[];
  postedProjects: string[];
}