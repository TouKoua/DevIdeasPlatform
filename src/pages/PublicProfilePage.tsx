import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  CalendarIcon, 
  ExternalLinkIcon,
  GithubIcon,
  TwitterIcon,
  RocketIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CodeIcon,
  CpuIcon
} from 'lucide-react';
import { User } from '../types';

const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { getUserById, getProjectsByUserId, currentUser } = useProjects();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'posted' | 'about'>('about');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const userProjects = getProjectsByUserId(userId || '');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData || null);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, getUserById]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <UserIcon size={64} className="mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User not found</h1>
        <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
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

  const isOwnProfile = currentUser && currentUser.id === user.id;
  const totalViews = userProjects.reduce((sum, project) => sum + project.views, 0);
  const joinedDate = new Date(user.joinedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });

  // If this is the user's own profile, redirect to the private profile page
  if (isOwnProfile) {
    navigate('/profile');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeftIcon size={18} className="mr-2" />
        Back
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-20 h-20 rounded-full"
            />
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center text-gray-500 mt-1">
                <CalendarIcon size={16} className="mr-1" />
                <span>Member since {joinedDate}</span>
              </div>
              {user.location && (
                <div className="flex items-center text-gray-500 mt-1">
                  <MapPinIcon size={16} className="mr-1" />
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(user.website || user.github || user.twitter) && (
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-gray-100">
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <ExternalLinkIcon size={16} className="mr-1" />
                Website
              </a>
            )}
            {user.github && (
              <a
                href={`https://github.com/${user.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <GithubIcon size={16} className="mr-1" />
                GitHub
              </a>
            )}
            {user.twitter && (
              <a
                href={`https://twitter.com/${user.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <TwitterIcon size={16} className="mr-1" />
                Twitter
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{userProjects.length}</div>
            <div className="text-sm text-gray-500">Posted Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalViews}</div>
            <div className="text-sm text-gray-500">Total Views</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center px-6 py-3 text-sm font-medium ${
                activeTab === 'about'
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserIcon size={18} className="mr-2" /> 
              Biography
            </button>
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
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'posted' && (
            <>
              {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userProjects.map(project => (
                    <Link to={`/project/${project.id}`} key={project.id}>
                      <ProjectCard project={project} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RocketIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 mb-4">
                    {user.name} hasn't posted any project ideas yet.
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {user.bio ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No bio yet</h3>
                  <p className="text-gray-500">
                    {user.name} hasn't added a bio yet.
                  </p>
                </div>
              )}

              {userProjects.length > 0 && (
                <>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Project Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Most Viewed Project</span>
                          <EyeIcon size={16} className="text-gray-500" />
                        </div>
                        {(() => {
                          const mostViewed = userProjects.reduce((prev, current) => 
                            prev.views > current.views ? prev : current
                          );
                          return (
                            <div>
                              <p className="font-medium text-gray-900">{mostViewed.title}</p>
                              <p className="text-sm text-gray-600">{mostViewed.views} views</p>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Latest Project</span>
                          <ClockIcon size={16} className="text-gray-500" />
                        </div>
                        {(() => {
                          const latest = userProjects.reduce((prev, current) => 
                            new Date(prev.createdAt) > new Date(current.createdAt) ? prev : current
                          );
                          return (
                            <div>
                              <p className="font-medium text-gray-900">{latest.title}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(latest.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Programming Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const languageCounts = userProjects.reduce((acc, project) => {
                          project.programmingLanguages.forEach(lang => {
                            acc[lang] = (acc[lang] || 0) + 1;
                          });
                          return acc;
                        }, {} as Record<string, number>);

                        return Object.entries(languageCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 10)
                          .map(([language, count]) => (
                            <Badge key={language} variant="primary" size="md">
                              <span className="flex items-center">
                                <CodeIcon size={14} className="mr-1" />
                                {language} ({count})
                              </span>
                            </Badge>
                          ));
                      })()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Programming Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const skillCounts = userProjects.reduce((acc, project) => {
                          project.programmingSkills.forEach(skill => {
                            acc[skill] = (acc[skill] || 0) + 1;
                          });
                          return acc;
                        }, {} as Record<string, number>);

                        return Object.entries(skillCounts)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 10)
                          .map(([skill, count]) => (
                            <Badge key={skill} variant="secondary" size="md">
                              <span className="flex items-center">
                                <CpuIcon size={14} className="mr-1" />
                                {skill} ({count})
                              </span>
                            </Badge>
                          ));
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;