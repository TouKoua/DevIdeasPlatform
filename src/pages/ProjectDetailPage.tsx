import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProjectCard from '../components/ProjectCard';
import { ThumbsUpIcon, BookmarkIcon, ClockIcon, TagIcon, ArrowLeftIcon, UserIcon } from 'lucide-react';

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

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getProjectById, projects, upvoteProject, saveProject, currentUser } = useProjects();
  const navigate = useNavigate();
  
  const project = getProjectById(id || '');
  
  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/')}
          icon={<ArrowLeftIcon size={18} />}
        >
          Back to Home
        </Button>
      </div>
    );
  }
  
  // Get similar projects by tags
  const similarProjects = projects
    .filter(p => 
      p.id !== project.id && 
      p.tags.some(tag => project.tags.includes(tag))
    )
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 3);
  
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6"
      >
        <ArrowLeftIcon size={18} className="mr-2" />
        Back
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <Badge 
                  variant={getDifficultyColor(project.difficulty)} 
                  size="lg"
                >
                  {project.difficulty}
                </Badge>
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <UserIcon size={16} className="mr-1" />
                <span>Posted by {project.createdBy.name} on {formattedDate}</span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
              </div>
              
              {project.estimatedTime && (
                <div className="flex items-center text-gray-700 mb-6">
                  <ClockIcon size={18} className="mr-2" />
                  <span>Estimated time to complete: <strong>{project.estimatedTime}</strong></span>
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <TagIcon size={18} className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-medium">Tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Link 
                      key={tag} 
                      to={`/search?tag=${tag}`} 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 border-t border-gray-100 pt-6">
                <Button
                  variant={project.upvoted ? 'primary' : 'outline'}
                  icon={<ThumbsUpIcon size={18} fill={project.upvoted ? "currentColor" : "none"} />}
                  onClick={() => upvoteProject(project.id)}
                  disabled={!currentUser}
                  title={currentUser ? undefined : "Sign in to upvote projects"}
                >
                  Upvote ({project.upvotes})
                </Button>
                
                <Button
                  variant={project.saved ? 'primary' : 'outline'}
                  icon={<BookmarkIcon size={18} />}
                  onClick={() => saveProject(project.id)}
                  disabled={!currentUser}
                  title={currentUser ? undefined : "Sign in to save projects"}
                >
                  {project.saved ? 'Saved' : 'Save for Later'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-4">
              <img 
                src={project.createdBy.avatar} 
                alt={project.createdBy.name}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="font-medium text-gray-900">{project.createdBy.name}</h3>
                <p className="text-gray-500 text-sm">Project Creator</p>
              </div>
            </div>
            <Link to={`/profile/${project.createdBy.id}`}>
              <Button variant="outline" fullWidth>
                View Profile
              </Button>
            </Link>
          </div>
          
          {similarProjects.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Similar Projects</h3>
              <div className="space-y-4">
                {similarProjects.map((similarProject) => (
                  <Link to={`/project/${similarProject.id}`} key={similarProject.id} className="block">
                    <ProjectCard project={similarProject} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;