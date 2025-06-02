import React, { useState, useEffect } from 'react';
import ProjectCard from '../components/ProjectCard';
import SearchFilters from '../components/SearchFilters';
import { useProjects } from '../context/ProjectContext';
import { Link } from 'react-router-dom';
import { SearchIcon } from 'lucide-react';

const SearchPage: React.FC = () => {
  const { projects, searchProjects } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ difficulty: [], tags: [] });
  const [searchResults, setSearchResults] = useState(projects);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);
  
  // Search when query or filters change
  useEffect(() => {
    const results = searchProjects(debouncedQuery, filters);
    setSearchResults(results);
  }, [debouncedQuery, filters, searchProjects]);
  
  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Project Ideas</h1>
      
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full text-lg"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SearchFilters onApplyFilters={handleApplyFilters} />
        </div>
        
        <div className="lg:col-span-3">
          {searchResults.length > 0 ? (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {searchResults.map((project) => (
                  <Link to={`/project/${project.id}`} key={project.id} className="block">
                    <ProjectCard project={project} />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <SearchIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ difficulty: [], tags: [] });
                }}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;