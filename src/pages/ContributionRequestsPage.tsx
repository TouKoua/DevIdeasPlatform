import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import { 
  ArrowLeftIcon, 
  UserIcon, 
  CalendarIcon, 
  MessageSquareIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  MailIcon,
  ExternalLinkIcon,
  SearchIcon
} from 'lucide-react';

const ContributionRequestsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    getProjectById, 
    getContributionRequestsForProject, 
    fetchContributionRequestsForProject,
    updateContributionRequestStatus,
    currentUser 
  } = useProjects();
  const navigate = useNavigate();
  
  const [responseMessages, setResponseMessages] = useState<Record<string, string>>({});
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  const [projectRequests, setProjectRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const project = getProjectById(id || '');

  // Fetch contribution requests when the component mounts or project ID changes
  useEffect(() => {
    const loadContributionRequests = async () => {
      if (id) {
        setRequestsLoading(true);
        try {
          await fetchContributionRequestsForProject(id);
          const requests = await getContributionRequestsForProject(id);
          setProjectRequests(requests);
        } catch (error) {
          console.error('Error loading contribution requests:', error);
          setProjectRequests([]);
        } finally {
          setRequestsLoading(false);
        }
      }
    };
    
    loadContributionRequests();
  }, [id, fetchContributionRequestsForProject]);

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
        <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
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

  // Check if user is the project owner
  if (!currentUser || currentUser.id !== project.createdBy.id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You can only manage contribution requests for projects you created.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate(`/project/${project.id}`)}
          icon={<ArrowLeftIcon size={18} />}
        >
          Back to Project
        </Button>
      </div>
    );
  }

  const contributionRequests = projectRequests;
  const pendingRequests = contributionRequests.filter(req => req.status === 'pending');
  const processedRequests = contributionRequests.filter(req => req.status !== 'pending');

  // Filter requests based on search query
  const filterRequestsBySearch = (requests: any[]) => {
    if (!searchQuery.trim()) return requests;
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return requests.filter(request => 
      request.requester?.name?.toLowerCase().includes(lowercaseQuery)
    );
  };

  const filteredPendingRequests = filterRequestsBySearch(pendingRequests);
  const filteredProcessedRequests = filterRequestsBySearch(processedRequests);
  const handleResponseMessageChange = (requestId: string, message: string) => {
    setResponseMessages(prev => ({
      ...prev,
      [requestId]: message
    }));
  };

  const handleRequestAction = async (requestId: string, status: 'accepted' | 'declined') => {
    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await updateContributionRequestStatus(
        requestId, 
        status, 
        responseMessages[requestId] || undefined
      );
      
      // Clear the response message after processing
      setResponseMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[requestId];
        return newMessages;
      });
    } catch (error) {
      console.error('Error updating contribution request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success" size="sm">Accepted</Badge>;
      case 'declined':
        return <Badge variant="danger" size="sm">Declined</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get the correct profile link for requesters
  const getRequesterProfileLink = (requesterId: string) => {
    if (!currentUser) {
      return `/public-profile/${requesterId}`;
    }
    
    if (currentUser.id === requesterId) {
      return '/profile'; // Own profile (unlikely in this context)
    }
    
    return `/public-profile/${requesterId}`; // Other user's public profile
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(`/project/${project.id}`)}
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeftIcon size={18} className="mr-2" />
        Back to Project
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Contribution Requests</h1>
            <p className="text-gray-600 mb-4">
              Manage collaboration requests for <strong>{project.title}</strong>
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <ClockIcon size={16} className="mr-1" />
                {pendingRequests.length} pending
              </span>
              <span className="flex items-center">
                <CheckIcon size={16} className="mr-1" />
                {processedRequests.filter(r => r.status === 'accepted').length} accepted
              </span>
              <span className="flex items-center">
                <XIcon size={16} className="mr-1" />
                {processedRequests.filter(r => r.status === 'declined').length} declined
              </span>
            </div>
          </div>
          <Link to={`/project/${project.id}`}>
            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLinkIcon size={16} />}
            >
              View Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      {contributionRequests.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon size={18} className="text-gray-400" />
            </div>
            <Input
              id="searchRequests"
              name="searchRequests"
              placeholder="Search by contributor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredPendingRequests.length + filteredProcessedRequests.length} of {contributionRequests.length} requests
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {/* Pending Requests */}
      {filteredPendingRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Pending Requests ({filteredPendingRequests.length})
            {searchQuery && pendingRequests.length !== filteredPendingRequests.length && (
              <span className="text-gray-500 text-sm font-normal ml-2">
                of {pendingRequests.length} total
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {filteredPendingRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Link to={getRequesterProfileLink(request.requester?.id || '')}>
                      <img
                        src={request.requester?.avatar}
                        alt={request.requester?.name}
                        className="w-12 h-12 rounded-full mr-4 hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div>
                      <Link 
                        to={getRequesterProfileLink(request.requester?.id || '')}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {request.requester?.name}
                      </Link>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarIcon size={14} className="mr-1" />
                        {formatDate(request.createdAt)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.message && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-md">
                    <div className="flex items-center mb-2">
                      <MessageSquareIcon size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Message from contributor:</span>
                    </div>
                    <p className="text-gray-700">{request.message}</p>
                  </div>
                )}

                <div className="mb-4">
                  <Textarea
                    id={`response-${request.id}`}
                    name={`response-${request.id}`}
                    label="Response Message (optional)"
                    placeholder="Add a personal message to your response..."
                    value={responseMessages[request.id] || ''}
                    onChange={(e) => handleResponseMessageChange(request.id, e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    icon={<CheckIcon size={18} />}
                    onClick={() => handleRequestAction(request.id, 'accepted')}
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? 'Processing...' : 'Accept'}
                  </Button>
                  <Button
                    variant="danger"
                    icon={<XIcon size={18} />}
                    onClick={() => handleRequestAction(request.id, 'declined')}
                    disabled={processingRequests.has(request.id)}
                  >
                    {processingRequests.has(request.id) ? 'Processing...' : 'Decline'}
                  </Button>
                  <Button
                    variant="outline"
                    icon={<MailIcon size={18} />}
                    onClick={() => window.location.href = `mailto:${request.requester?.name?.toLowerCase().replace(' ', '.')}@example.com`}
                  >
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processed Requests */}
      {filteredProcessedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Processed Requests ({filteredProcessedRequests.length})
            {searchQuery && processedRequests.length !== filteredProcessedRequests.length && (
              <span className="text-gray-500 text-sm font-normal ml-2">
                of {processedRequests.length} total
              </span>
            )}
          </h2>
          <div className="space-y-4">
            {filteredProcessedRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <Link to={getRequesterProfileLink(request.requester?.id || '')}>
                      <img
                        src={request.requester?.avatar}
                        alt={request.requester?.name}
                        className="w-10 h-10 rounded-full mr-3 hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div>
                      <Link 
                        to={getRequesterProfileLink(request.requester?.id || '')}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {request.requester?.name}
                      </Link>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <CalendarIcon size={14} className="mr-1" />
                        Requested {formatDate(request.createdAt)}
                        <span className="mx-2">•</span>
                        Responded {formatDate(request.updatedAt)}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.message && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">{request.message}</p>
                  </div>
                )}

                {request.responseMessage && (
                  <div className={`p-3 rounded-md ${
                    request.status === 'accepted' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center mb-1">
                      <UserIcon size={14} className="text-gray-500 mr-1" />
                      <span className="text-sm font-medium text-gray-700">Your response:</span>
                    </div>
                    <p className="text-sm text-gray-700">{request.responseMessage}</p>
                  </div>
                )}

                {/* Re-accept button for removed teammates */}
                {request.status === 'removed' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<CheckIcon size={16} />}
                      onClick={() => handleRequestAction(request.id, 'accepted')}
                      disabled={processingRequests.has(request.id)}
                    >
                      {processingRequests.has(request.id) ? 'Processing...' : 'Re-accept Teammate'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {contributionRequests.length === 0 ? (
        // No requests at all
        <div className="text-center py-16">
          <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contribution requests yet</h3>
          <p className="text-gray-500 mb-6">
            When developers are interested in contributing to your project, their requests will appear here.
          </p>
          <Link to={`/project/${project.id}`}>
            <Button variant="primary">
              Back to Project
            </Button>
          </Link>
        </div>
      ) : (filteredPendingRequests.length === 0 && filteredProcessedRequests.length === 0) ? (
        // No requests match search
        <div className="text-center py-16">
          <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500 mb-6">
            No contribution requests match your search for "{searchQuery}".
          </p>
          <Button
            variant="outline"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ContributionRequestsPage;