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

const popularLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS'
];

const popularSkills = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Django', 'Flask', 'Spring Boot',
  'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Machine Learning',
  'React Native', 'Flutter', 'GraphQL', 'REST API', 'DevOps', 'Testing'
];

const SearchFilters: React.FC<SearchFiltersProps> = ({ onApplyFilters }) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulties.includes(difficulty)) {
      setSelectedDifficulties(selectedDifficulties.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulties([...selectedDifficulties, difficulty]);
    }
  };
  
  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== language));
    } else {
      setSelectedLanguages([...selectedLanguages, language]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  const applyFilters = () => {
    onApplyFilters({
      difficulty: selectedDifficulties,
      programmingLanguages: selectedLanguages,
      programmingSkills: selectedSkills
    });
  };
  
  const clearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedLanguages([]);
    setSelectedSkills([]);
    onApplyFilters({
      difficulty: [],
      programmingLanguages: [],
      programmingSkills: []
    });
  };
  
  const hasActiveFilters = selectedDifficulties.length > 0 || selectedLanguages.length > 0 || selectedSkills.length > 0;
  
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
            <h4 className="text-sm font-medium text-gray-700 mb-2">Programming Languages</h4>
            <div className="flex flex-wrap gap-2">
              {popularLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => toggleLanguage(language)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedLanguages.includes(language)
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Programming Skills</h4>
            <div className="flex flex-wrap gap-2">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {skill}
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
            
            {selectedLanguages.map((language) => (
              <Badge key={language} variant="primary" size="md">
                <span className="flex items-center">
                  {language}
                  <button
                    onClick={() => toggleLanguage(language)}
                    className="ml-1.5 text-indigo-700 hover:text-indigo-900"
                  >
                    <XIcon size={14} />
                  </button>
                </span>
              </Badge>
            ))}

            {selectedSkills.map((skill) => (
              <Badge key={skill} variant="secondary" size="md">
                <span className="flex items-center">
                  {skill}
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="ml-1.5 text-emerald-700 hover:text-emerald-900"
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