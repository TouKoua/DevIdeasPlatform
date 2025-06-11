import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Badge from './ui/Badge';
import { 
  RocketIcon, 
  PlusSquareIcon, 
  EditIcon, 
  EyeIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ClockIcon,
  BookmarkIcon,
  FolderIcon,
  TrendingUpIcon
} from 'lucide-react';

const ProjectsSidebar: React.FC = () => {
  const { currentUser, projects } = useProjects();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!currentUser) return null;

  const userProjects = projects.filter(project => project.createdBy.id === currentUser.id);
  const savedProjects = projects.filter(project => project.saved);
  
  // Sort projects by most recent
  const sortedUserProjects = [...userProjects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5); // Show only the 5 most recent

  const sortedSavedProjects = [...savedProjects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3); // Show only the 3 most recent

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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto sticky top-16">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FolderIcon size={20} className="mr-2 text-indigo-600" />
            My Projects
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon size={16} className="text-gray-500" />
            ) : (
              <ChevronRightIcon size={16} className="text-gray-500" />
            )}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-indigo-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-indigo-600">{userProjects.length}</div>
                <div className="text-xs text-indigo-600">Posted</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-600">{savedProjects.length}</div>
                <div className="text-xs text-emerald-600">Saved</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-amber-600">
                  {userProjects.reduce((sum, project) => sum + project.views, 0)}
                </div>
                <div className="text-xs text-amber-600">Views</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <Link to="/new-project">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center">
                  <PlusSquareIcon size={16} className="mr-2" />
                  Post New Idea
                </button>
              </Link>
            </div>

            {/* Recent Projects */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <RocketIcon size={16} className="mr-1 text-gray-500" />
                  Recent Projects
                </h3>
                {userProjects.length > 5 && (
                  <Link to="/profile" className="text-xs text-indigo-600 hover:text-indigo-800">
                    View all
                  </Link>
                )}
              </div>
              
              {sortedUserProjects.length > 0 ? (
                <div className="space-y-2">
                  {sortedUserProjects.map((project) => (
                    <div key={project.id} className="group">
                      <Link 
                        to={`/project/${project.id}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-indigo-600">
                            {project.title}
                          </h4>
                          <Badge 
                            variant={getDifficultyColor(project.difficulty)} 
                            size="sm"
                          >
                            {project.difficulty.charAt(0).toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {project.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <ClockIcon size={12} className="mr-1" />
                            {formatDate(project.createdAt)}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <EyeIcon size={12} className="mr-1" />
                              {project.views}
                            </span>
                            <Link 
                              to={`/project/${project.id}/edit`}
                              className="p-1 rounded hover:bg-indigo-100 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EditIcon size={12} className="text-gray-400 hover:text-indigo-600" />
                            </Link>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <RocketIcon size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No projects yet</p>
                  <Link to="/new-project" className="text-xs text-indigo-600 hover:text-indigo-800">
                    Create your first project
                  </Link>
                </div>
              )}
            </div>

            {/* Saved Projects */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <BookmarkIcon size={16} className="mr-1 text-gray-500" />
                  Saved Projects
                </h3>
                {savedProjects.length > 3 && (
                  <Link to="/profile" className="text-xs text-indigo-600 hover:text-indigo-800">
                    View all
                  </Link>
                )}
              </div>
              
              {sortedSavedProjects.length > 0 ? (
                <div className="space-y-2">
                  {sortedSavedProjects.map((project) => (
                    <div key={project.id} className="group">
                      <Link 
                        to={`/project/${project.id}`}
                        className="block p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1 group-hover:text-emerald-600">
                            {project.title}
                          </h4>
                          <Badge 
                            variant={getDifficultyColor(project.difficulty)} 
                            size="sm"
                          >
                            {project.difficulty.charAt(0).toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="text-gray-600">by {project.createdBy.name}</span>
                          <div className="flex items-center">
                            <EyeIcon size={12} className="mr-1" />
                            {project.views}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookmarkIcon size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No saved projects</p>
                  <Link to="/" className="text-xs text-indigo-600 hover:text-indigo-800">
                    Explore projects
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Links</h3>
              <div className="space-y-1">
                <Link 
                  to="/profile"
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <EyeIcon size={16} className="mr-2" />
                  View Profile
                </Link>
                <Link 
                  to="/search"
                  className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <TrendingUpIcon size={16} className="mr-2" />
                  Discover Projects
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsSidebar;