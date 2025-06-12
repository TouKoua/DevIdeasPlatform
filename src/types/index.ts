export interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  programmingLanguages: string[];
  programmingSkills: string[];
  createdAt: Date;
  updatedAt?: Date;
  createdBy: {
    id: string;
    name: string;
    avatar: string;
  };
  views: number;
  estimatedTime?: string;
  saved?: boolean;
  maxContributors?: number;
  currentContributors?: number;
  showContributorCount?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  joinedDate: Date;
  savedProjects: string[];
  postedProjects: string[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  projectId?: string;
  type: 'view' | 'recommendation' | 'welcome';
}

export interface ContributionRequest {
  id: string;
  projectId: string;
  requesterId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  updatedAt: Date;
  responseMessage?: string;
  // Populated fields
  project?: ProjectIdea;
  requester?: User;
}