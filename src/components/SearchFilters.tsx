import React, { useState } from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { XIcon, FilterIcon } from 'lucide-react';

interface SearchFiltersProps {
  onApplyFilters: (filters: any) => void;
}

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const popularTags = [
  'react', 'javascript', 'python', 'web', 'mobile', 'api', 
  'fullstack', 'frontend', 'backend', 'database', 'ai', 'game'
];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onApplyFilters }) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulties([...selectedDifficulties, difficulty]);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const applyFilters = () => {
    onApplyFilters({
      difficulty: selectedDifficulties,
      tags: selectedTags
    });
  };
  
  const clearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedTags([]);
    onApplyFilters({
      difficulty: [],
      tags: []
    });
  };
  
  const hasActiveFilters = selectedDifficulties.length > 0 || selectedTags.length > 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <div className="flex space-x-2">
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<FilterIcon size={16} />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Difficulty Level</h4>
            <div className="flex flex-wrap gap-2">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleDifficulty(option.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedDifficulties.includes(option.value)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h4>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            variant="primary" 
            size="md" 
            onClick={applyFilters}
            fullWidth
          >
            Apply Filters
          </Button>
        </div>
      )}
      
      {hasActiveFilters && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedDifficulties.map((difficulty) => (
              <Badge key={difficulty} variant="primary" size="md">
                <span className="flex items-center">
                  {difficulty}
                  <button
                    onClick={() => toggleDifficulty(difficulty)}
                    className="ml-1.5 text-indigo-700 hover:text-indigo-900"
                  >
                    <XIcon size={14} />
                  </button>
                </span>
              </Badge>
            ))}
            
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="default" size="md">
                <span className="flex items-center">
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-1.5 text-gray-700 hover:text-gray-900"
                  >
                    <XIcon size={14} />
                  </button>
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;