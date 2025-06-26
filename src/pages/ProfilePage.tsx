import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Settings, PlusSquareIcon, BookmarkIcon, RocketIcon, BellIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { currentUser, projects, notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteProject } = useProjects();
  const [activeTab, setActiveTab] = useState<'posted' | 'saved' | 'notifications'>('posted');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
        <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
        <Link to="/login">
          <Button variant="primary">Sign in</Button>
        </Link>
      </div>
    );
  }

  const postedProjects = projects.filter(project => project.createdBy.id === currentUser.id);
  const savedProjects = projects.filter(project => project.saved);

  const handleDeleteClick = (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(projectId);
    setShowDeleteModal(true);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsDeleting(true);
    
    try {
      await deleteProject(projectToDelete);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const projectToDeleteData = projectToDelete ? projects.find(p => p.id === projectToDelete) : null;

  const formatNotificationTime = (createdAt: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return createdAt.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{currentUser.name}</h1>
              <p className="text-gray-500">Member since {new Date().getFullYear()}</p>
            </div>
          </div>
          <Link to="/settings">
            <Button
              variant="outline"
              size="sm"
              icon={<Settings size={18} />}
            >
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{postedProjects.length}</div>
            <div className="text-sm text-gray-500">Posted Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{savedProjects.length}</div>
            <div className="text-sm text-gray-500">Saved Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {postedProjects.reduce((sum, project) => sum + project.views, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => !n.readStatus).length}
            </div>
            <div className="text-sm text-gray-500">Unread Notifications</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === 'posted'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <RocketIcon size={18} className="mr-2" />
              Posted Projects
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === 'saved'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BookmarkIcon size={18} className="mr-2" />
              Saved Projects
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BellIcon size={18} className="mr-2" />
              Notifications
              {notifications.some(n => !n.readStatus) && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {notifications.filter(n => !n.readStatus).length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'posted' && (
            <>
              {postedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {postedProjects.map(project => (
                    <div key={project.id} className="relative group">
                      <Link to={`/project/${project.id}`} state={{from: 'home'}}>
                        <ProjectCard project={project} />
                      </Link>
                      
                      {/* Delete button overlay */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<TrashIcon size={16} />}
                          onClick={(e) => handleDeleteClick(project.id, e)}
                          title="Delete project"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RocketIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">Share your first project idea with the community</p>
                  <Link to="/new-project">
                    <Button
                      variant="primary"
                      icon={<PlusSquareIcon size={18} />}
                    >
                      Post New Idea
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <>
              {savedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {savedProjects.map(project => (
                    <Link to={`/project/${project.id}`} key={project.id}>
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved projects</h3>
                  <p className="text-gray-500 mb-4">Browse projects and save your favorites for later</p>
                  <Link to="/">
                    <Button
                      variant="primary"
                      icon={<RocketIcon size={18} />}
                    >
                      Explore Projects
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'notifications' && (
            <div className="divide-y divide-gray-100">
              {notifications.length > 0 ? (
                <>
                  <div className="flex justify-between items-center pb-4">
                    <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
                    {notifications.some(n => !n.readStatus) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllNotificationsAsRead}
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`py-4 cursor-pointer hover:bg-gray-50 rounded-md px-3 -mx-3 transition-colors ${
                        !notification.readStatus ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${!notification.readStatus ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.readStatus && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-12">
                  <BellIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </div>
              )}
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
        {projectToDeleteData && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangleIcon size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this project?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete the project "{projectToDeleteData.title}" 
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
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;