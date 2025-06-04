import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';
import { Settings, PlusSquareIcon, BookmarkIcon, RocketIcon, BellIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { currentUser, projects, notifications, markNotificationAsRead, markAllNotificationsAsRead } = useProjects();
  const [activeTab, setActiveTab] = useState<'posted' | 'saved' | 'notifications'>('posted');

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
              {postedProjects.reduce((sum, project) => sum + project.upvotes, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Upvotes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {notifications.filter(n => n.unread).length}
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
              {notifications.some(n => n.unread) && (
                <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {notifications.filter(n => n.unread).length}
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
                    <Link to={`/project/${project.id}`} key={project.id}>
                      <ProjectCard project={project} />
                    </Link>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllNotificationsAsRead}
                    >
                      Mark all as read
                    </Button>
                  </div>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`py-4 ${notification.unread ? 'bg-indigo-50' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                        {notification.unread && (
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
    </div>
  );
};

export default ProfilePage;