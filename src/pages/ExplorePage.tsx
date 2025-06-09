import React, { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { TrendingUpIcon, LayersIcon, SearchIcon, ZapIcon, PlusSquareIcon, ClockIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const ExplorePage: React.FC = () => {
  const { projects } = useProjects();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

  // Get trending projects (most upvoted)
  const trendingProjects = [...projects]
    .sort((a, b) => b.upvotes - a.upvotes)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Explore Project Ideas</h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projectsToDisplay.map(project => (
          <Link to={`/project/${project.id}`} key={project.id} className="block">
            <ProjectCard project={project} />
          </Link>
        ))}
      </div>

      {/* Explore more link */}
      <div className="mt-8 text-center">
        <Link to="/search" className="text-indigo-600 hover:text-indigo-800 font-medium">
          Explore more project ideas →
        </Link>
      </div>
    </div>
  );
};

export default ExplorePage;