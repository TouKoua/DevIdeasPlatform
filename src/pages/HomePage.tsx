import React, { useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { TrendingUpIcon, LayersIcon, SearchIcon, ZapIcon, PlusSquareIcon, ClockIcon } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
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
      {/* Hero section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-8 mb-10 text-white">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold mb-4">Discover your next coding project</h1>
          <p className="text-indigo-100 mb-6">
            Browse through hundreds of project ideas or share your own with the community.
            Find inspiration, learn new skills, and build your portfolio.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/new-project">
              <Button 
                variant="secondary" 
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
                className="bg-white/10 border-white/20 hover:bg-white/20"
              >
                Search Ideas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto pb-4 mb-6 gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap ${
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

export default HomePage;