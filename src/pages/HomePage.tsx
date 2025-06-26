import React, { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'next/navigation';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { TrendingUpIcon, LayersIcon, SearchIcon, ZapIcon, PlusSquareIcon, ClockIcon, RefreshCwIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const { projects, loading, refreshProjects } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All Projects', icon: <LayersIcon size={18} /> },
    { id: 'recent', name: 'Recent', icon: <ClockIcon size={18} /> },
    { id: 'trending', name: 'Trending', icon: <TrendingUpIcon size={18} /> },
    { id: 'beginner', name: 'Beginner Friendly', icon: <ZapIcon size={18} /> }
  ];

  // Get the latest 12 projects
  const latestProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 12);

  // Get trending projects (most viewed)
  const trendingProjects = [...projects]
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);

  // Get beginner-friendly projects
  const beginnerProjects = projects
    .filter(project => project.difficulty === 'beginner')
    .slice(0, 12);

  const getProjectsToDisplay = () => {
    switch (selectedCategory) {
      case 'recent':
        return latestProjects;
      case 'trending':
        return trendingProjects;
      case 'beginner':
        return beginnerProjects;
      default:
        return projects.slice(0, 12); // Show first 12 projects for "All" category
    }
  };

  const projectsToDisplay = getProjectsToDisplay();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProjects();
    } catch (error) {
      console.error('Error refreshing projects:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex space-x-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Explore Project Ideas</h1>
          <Button
            variant="outline"
            size="md"
            icon={<RefreshCwIcon size={18} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Browse through hundreds of project ideas from the community. Find inspiration, 
          learn new skills, and build your portfolio with projects that match your interests and skill level.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/new-project">
          <Button 
            variant="primary" 
            size="lg"
            icon={<PlusSquareIcon size={20} />}
          >
            Post New Idea
          </Button>
        </Link>
        <Link to="/search">
          <Button 
            variant="outline" 
            size="lg"
            icon={<SearchIcon size={20} />}
          >
            Advanced Search
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {projectsToDisplay.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsToDisplay.map(project => (
            <Link to={`/project/${project.id}?prev=home`} key={project.id} className="block">
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <LayersIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            {selectedCategory === 'all' 
              ? "No projects have been created yet. Be the first to share your idea!"
              : `No ${selectedCategory} projects found. Try a different category or create a new project.`
            }
          </p>
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

      {/* Explore more link */}
      {projectsToDisplay.length > 0 && projects.length > 12 && (
        <div className="mt-8 text-center">
          <Link to="/search" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Explore more project ideas →
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;