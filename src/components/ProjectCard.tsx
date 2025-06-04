import React from 'react';
import { ProjectIdea } from '../types';
import Badge from './ui/Badge';
import { BookmarkIcon, ThumbsUpIcon, ClockIcon } from 'lucide-react';
import { useProjects } from '../context/ProjectContext';

interface ProjectCardProps {
  project: ProjectIdea;
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'danger';
    default:
      return 'default';
  }
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { upvoteProject, saveProject, currentUser } = useProjects();
  
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleButtonClick = (e: React.MouseEvent, callback: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentUser) {
      callback();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px]">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
          <Badge 
            variant={getDifficultyColor(project.difficulty)}
            size="sm"
          >
            {project.difficulty}
          </Badge>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.map((tag) => (
            <Badge key={tag} size="sm" variant="default">
              {tag}
            </Badge>
          ))}
        </div>
        
        {project.estimatedTime && (
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <ClockIcon size={16} className="mr-1" />
            <span>Est. time: {project.estimatedTime}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <img 
              src={project.createdBy.avatar} 
              alt={project.createdBy.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">
              {project.createdBy.name} • {formattedDate}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`flex items-center transition-colors ${
                project.upvoted ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'
              } ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
              onClick={(e) => handleButtonClick(e, () => upvoteProject(project.id))}
              title={currentUser ? undefined : "Sign in to upvote projects"}
            >
              <ThumbsUpIcon 
                size={18} 
                className="mr-1"
                fill={project.upvoted ? "currentColor" : "none"}
              />
              <span>{project.upvotes}</span>
            </button>
            
            <button 
              className={`flex items-center transition-colors ${
                project.saved ? 'text-amber-500' : 'text-gray-500 hover:text-amber-500'
              } ${!currentUser && 'opacity-50 cursor-not-allowed'}`}
              onClick={(e) => handleButtonClick(e, () => saveProject(project.id))}
              title={currentUser ? undefined : "Sign in to save projects"}
            >
              <BookmarkIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;