import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import ProjectCard from '../components/ProjectCard';
import { EyeIcon, BookmarkIcon, ClockIcon, CodeIcon, CpuIcon, ArrowLeftIcon, UserIcon, EditIcon, MailIcon, UsersIcon, MessageSquareIcon, SendIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';

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
  const { 
    getProjectById, 
    projects, 
    incrementProjectViews, 
    saveProject, 
    currentUser,
    createContributionRequest,
    getContributionRequestsForProject,
    deleteProject
  } = useProjects();
  const navigate = useNavigate();
  const [isRequestingContribution, setIsRequestingContribution] = useState(false);
  const [contributionRequestSent, setContributionRequestSent] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionMessage, setContributionMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [similarProjects, setSimilarProjects] = useState<any[]>([]);
  
  const project = getProjectById(id || '');
  const contributionRequests = getContributionRequestsForProject(id || '');
  
  // Calculate similar projects only once when the project loads or changes
  useEffect(() => {
    if (project) {
      const similar = projects
        .filter(p => 
          p.id !== project.id && (
            p.programmingLanguages.some(lang => project.programmingLanguages.includes(lang)) ||
            p.programmingSkills.some(skill => project.programmingSkills.includes(skill))
          )
        )
        .sort(() => 0.5 - Math.random()) // Shuffle
        .slice(0, 3);
      
      setSimilarProjects(similar);
    }
  }, [project?.id]); // Only depend on project.id, not the entire projects array
  
  // Increment views when project is loaded
  useEffect(() => {
    if (project) {
      incrementProjectViews(project.id);
    }
  }, [project?.id, incrementProjectViews]);
  
  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/home')}
          icon={<ArrowLeftIcon size={18} />}
        >
          Back to Home
        </Button>
      </div>
    );
  }
  
  // Use updatedAt if available, otherwise use createdAt
  const displayDate = project.updatedAt || project.createdAt;
  const isUpdated = !!project.updatedAt;
  
  const formattedDate = new Date(displayDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isOwner = currentUser && currentUser.id === project.createdBy.id;
  const pendingRequests = contributionRequests.filter(req => req.status === 'pending');
  const acceptedRequests = contributionRequests.filter(req => req.status === 'accepted');
  
  // Check if current user has already requested to contribute
  const hasRequestedContribution = currentUser && contributionRequests.some(
    req => req.requesterId === currentUser.id
  );

  // Check if contributor limit is reached
  const isContributorLimitReached = project.maxContributors && project.maxContributors > 0
    ? acceptedRequests.length >= project.maxContributors
    : false;

  // Check if we should show contributor info (only if project creator allows it or if it's the creator viewing)
  const shouldShowContributorInfo = project.showContributorCount !== false || isOwner;

  // Determine the correct profile link for the project creator
  const getCreatorProfileLink = () => {
    if (!currentUser) {
      return `/public-profile/${project.createdBy.id}`;
    }
    
    if (currentUser.id === project.createdBy.id) {
      return '/profile'; // Own profile
    }
    
    return `/public-profile/${project.createdBy.id}`; // Other user's public profile
  };

  const handleRequestContribution = async () => {
    if (!currentUser || showContributionForm) return;
    setShowContributionForm(true);
  };

  const handleSubmitContributionRequest = async () => {
    if (!currentUser) return;

    setIsRequestingContribution(true);
    
    try {
      await createContributionRequest(project.id, contributionMessage.trim() || undefined);
      setContributionRequestSent(true);
      setShowContributionForm(false);
      setContributionMessage('');
    } catch (error) {
      console.error('Error sending contribution request:', error);
      alert('Failed to send contribution request. Please try again.');
    } finally {
      setIsRequestingContribution(false);
    }
  };

  const handleCancelContributionRequest = () => {
    setShowContributionForm(false);
    setContributionMessage('');
  };

  const handleDeleteProject = async () => {
    if (!currentUser || !isOwner) return;

    setIsDeleting(true);
    
    try {
      await deleteProject(project.id);
      setShowDeleteModal(false);
      navigate('/profile'); // Redirect to profile after deletion
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
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
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getDifficultyColor(project.difficulty)} 
                    size="lg"
                  >
                    {project.difficulty}
                  </Badge>
                  {isUpdated && (
                    <Badge variant="primary" size="lg">
                      Updated
                    </Badge>
                  )}
                  {isContributorLimitReached && shouldShowContributorInfo && (
                    <Badge variant="danger" size="lg">
                      Full
                    </Badge>
                  )}
                  {isOwner && (
                    <div className="flex gap-2">
                      <Link to={`/project/${project.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<EditIcon size={16} />}
                        >
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<TrashIcon size={16} />}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        Delete
                      </Button>
                      {pendingRequests.length > 0 && (
                        <Link to={`/project/${project.id}/contributions`}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<UsersIcon size={16} />}
                          >
                            Requests ({pendingRequests.length})
                          </Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 mb-6">
                <UserIcon size={16} className="mr-1" />
                <span>
                  {isUpdated ? 'Updated' : 'Posted'} by{' '}
                  <Link 
                    to={getCreatorProfileLink()}
                    className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                  >
                    {project.createdBy.name}
                  </Link>
                  {' '}on {formattedDate}
                  {isUpdated && (
                    <span className="text-gray-500 ml-2">
                      (Originally posted {new Date(project.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })})
                    </span>
                  )}
                </span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{project.description}</p>
              </div>
              
              {/* Project Info */}
              <div className="space-y-3 mb-6">
                {project.estimatedTime && (
                  <div className="flex items-center text-gray-700">
                    <ClockIcon size={18} className="mr-2" />
                    <span>Estimated time to complete: <strong>{project.estimatedTime}</strong></span>
                  </div>
                )}

                {project.maxContributors !== undefined && shouldShowContributorInfo && (
                  <div className="flex items-center text-gray-700">
                    <UsersIcon size={18} className="mr-2" />
                    <span>
                      Looking for{' '}
                      <strong>
                        {project.maxContributors === 0 ? 'unlimited contributors' : `${project.maxContributors} contributor${project.maxContributors !== 1 ? 's' : ''}`}
                      </strong>
                      {project.maxContributors > 0 && (
                        <span className="ml-2 text-gray-600">
                          ({acceptedRequests.length}/{project.maxContributors} joined)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Programming Languages */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <CodeIcon size={18} className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-medium">Programming Languages:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.programmingLanguages.map((language) => (
                    <Link 
                      key={language} 
                      to={`/search?language=${language}`} 
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {language}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Programming Skills */}
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <CpuIcon size={18} className="text-gray-500 mr-2" />
                  <span className="text-gray-700 font-medium">Programming Skills & Technologies:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.programmingSkills.map((skill) => (
                    <Link 
                      key={skill} 
                      to={`/search?skill=${skill}`} 
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-sm transition-colors"
                    >
                      {skill}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 border-t border-gray-100 pt-6">
                <div className="flex items-center text-gray-600">
                  <EyeIcon size={18} className="mr-2" />
                  <span>{project.views} views</span>
                </div>
                
                <Button
                  variant={project.saved ? 'primary' : 'outline'}
                  icon={<BookmarkIcon size={18} />}
                  onClick={() => saveProject(project.id)}
                  disabled={!currentUser}
                  title={currentUser ? undefined : "Sign in to save projects"}
                >
                  {project.saved ? 'Saved' : 'Save for Later'}
                </Button>

                {/* Request Contribution Button */}
                {currentUser && !isOwner && !hasRequestedContribution && !isContributorLimitReached && (
                  <Button
                    variant="outline"
                    icon={<MailIcon size={18} />}
                    onClick={handleRequestContribution}
                    title="Request to contribute to this project"
                  >
                    Request Contribution
                  </Button>
                )}

                {/* Show status if user has already requested */}
                {currentUser && !isOwner && hasRequestedContribution && (
                  <Button
                    variant="secondary"
                    icon={<MessageSquareIcon size={18} />}
                    disabled
                  >
                    Request Sent
                  </Button>
                )}

                {/* Show if contributor limit reached */}
                {!isOwner && isContributorLimitReached && shouldShowContributorInfo && (
                  <Button
                    variant="outline"
                    icon={<UsersIcon size={18} />}
                    disabled
                  >
                    Contributors Full
                  </Button>
                )}
              </div>

              {/* Contribution Request Form */}
              {showContributionForm && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Request to Contribute</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Send a message to {project.createdBy.name} explaining why you'd like to contribute to this project.
                  </p>
                  
                  <Textarea
                    id="contributionMessage"
                    name="contributionMessage"
                    placeholder="Hi! I'm interested in contributing to your project because..."
                    value={contributionMessage}
                    onChange={(e) => setContributionMessage(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  
                  <div className="flex space-x-3">
                    <Button
                      variant="primary"
                      icon={<SendIcon size={18} />}
                      onClick={handleSubmitContributionRequest}
                      disabled={isRequestingContribution}
                    >
                      {isRequestingContribution ? 'Sending...' : 'Send Request'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelContributionRequest}
                      disabled={isRequestingContribution}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Contribution Request Success Message */}
              {contributionRequestSent && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <MailIcon size={16} className="text-green-600 mr-2" />
                    <p className="text-sm text-green-800">
                      Your contribution request has been sent to {project.createdBy.name}. They will be notified and can respond to your request.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex items-center mb-4">
              <Link to={getCreatorProfileLink()}>
                <img 
                  src={project.createdBy.avatar} 
                  alt={project.createdBy.name}
                  className="w-12 h-12 rounded-full mr-4 hover:opacity-80 transition-opacity"
                />
              </Link>
              <div>
                <Link 
                  to={getCreatorProfileLink()}
                  className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  {project.createdBy.name}
                </Link>
                <p className="text-gray-500 text-sm">Project Creator</p>
              </div>
            </div>
            <Link to={getCreatorProfileLink()}>
              <Button variant="outline" fullWidth>
                View Profile
              </Button>
            </Link>
          </div>

          {/* Contribution Requests Summary for Owner */}
          {isOwner && contributionRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contribution Requests</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-orange-600">
                    {contributionRequests.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Accepted:</span>
                  <span className="font-medium text-green-600">
                    {contributionRequests.filter(r => r.status === 'accepted').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Declined:</span>
                  <span className="font-medium text-red-600">
                    {contributionRequests.filter(r => r.status === 'declined').length}
                  </span>
                </div>
              </div>
              <Link to={`/project/${project.id}/contributions`}>
                <Button variant="primary" fullWidth icon={<UsersIcon size={18} />}>
                  Manage Requests
                </Button>
              </Link>
            </div>
          )}
          
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="md"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<TrashIcon size={18} />}
              onClick={handleDeleteProject}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangleIcon size={24} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Are you sure you want to delete this project?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. This will permanently delete the project "{project.title}" 
              and all associated data including contribution requests and comments.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> All data related to this project will be permanently removed 
                from our servers.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;