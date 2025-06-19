import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectIdea } from '../types';
import Badge from './ui/Badge';
import { BookmarkIcon, EyeIcon, ClockIcon, CodeIcon, CpuIcon, UsersIcon } from 'lucide-react';
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
  const { saveProject, currentUser } = useProjects();
  
  // Use updatedAt if available, otherwise use createdAt
  const displayDate = project.updatedAt || project.createdAt;
  const isUpdated = !!project.updatedAt;
  
  const formattedDate = new Date(displayDate).toLocaleDateString('en-US', {
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

  const handleUserClick = (e: React.MouseEvent) => {
    // Only stop propagation to prevent the card click, but allow navigation
    e.stopPropagation();
  };

  // Always navigate to public profile page for project creators
  const getProfileLink = () => {
    return `/public-profile/${project.createdBy.id}`;
  };

  // Check if contributor limit is reached
  const isContributorLimitReached = project.maxContributors && project.currentContributors 
    ? project.currentContributors >= project.maxContributors 
    : false;

  // Check if we should show contributor info (only if project creator allows it or if it's the creator viewing)
  const shouldShowContributorInfo = project.showContributorCount !== false || 
    (currentUser && currentUser.id === project.createdBy.id);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg hover:translate-y-[-2px]">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
          <div className="flex items-center gap-2">
            <Badge 
              variant={getDifficultyColor(project.difficulty)}
              size="sm"
            >
              {project.difficulty}
            </Badge>
            {isUpdated && (
              <Badge variant="primary" size="sm">
                Updated
              </Badge>
            )}
            {isContributorLimitReached && shouldShowContributorInfo && (
              <Badge variant="danger" size="sm">
                Full
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        {/* Programming Languages */}
        <div className="mb-3">
          <div className="flex items-center mb-1">
            <CodeIcon size={14} className="text-gray-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Languages:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.programmingLanguages.slice(0, 3).map((language) => (
              <Badge key={language} size="sm" variant="primary">
                {language}
              </Badge>
            ))}
            {project.programmingLanguages.length > 3 && (
              <Badge size="sm" variant="default">
                +{project.programmingLanguages.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Programming Skills */}
        <div className="mb-4">
          <div className="flex items-center mb-1">
            <CpuIcon size={14} className="text-gray-500 mr-1" />
            <span className="text-xs font-medium text-gray-700">Skills:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {project.programmingSkills.slice(0, 3).map((skill) => (
              <Badge key={skill} size="sm" variant="secondary">
                {skill}
              </Badge>
            ))}
            {project.programmingSkills.length > 3 && (
              <Badge size="sm" variant="default">
                +{project.programmingSkills.length - 3}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Project Info */}
        <div className="space-y-2 mb-4">
          {project.estimatedTime && (
            <div className="flex items-center text-gray-500 text-sm">
              <ClockIcon size={16} className="mr-1" />
              <span>Est. time: {project.estimatedTime}</span>
            </div>
          )}
          
          {project.maxContributors && shouldShowContributorInfo && (
            <div className="flex items-center text-gray-500 text-sm">
              <UsersIcon size={16} className="mr-1" />
              <span>
                Looking for {project.maxContributors === 0 ? 'unlimited' : project.maxContributors} contributor{project.maxContributors !== 1 ? 's' : ''}
                {project.currentContributors !== undefined && project.maxContributors > 0 && (
                  <span className="ml-1">
                    ({project.currentContributors}/{project.maxContributors} joined)
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center">
            <Link 
              to={getProfileLink()}
              onClick={handleUserClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src={project.createdBy.avatar} 
                alt={project.createdBy.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {project.createdBy.name}
              </span>
            </Link>
            <span className="text-sm text-gray-600 mx-1">•</span>
            <span className="text-sm text-gray-600">
              {isUpdated ? 'Updated' : 'Posted'} {formattedDate}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex items-center text-gray-500">
              <EyeIcon size={18} className="mr-1" />
              <span>{project.views}</span>
            </div>
            
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