import React, { useState } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, PlusCircleIcon, UsersIcon, EyeIcon, EyeOffIcon, ActivityIcon } from 'lucide-react';

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const statusOptions = [
  { value: 'recruiting', label: 'Recruiting Contributors' },
  { value: 'working', label: 'Currently Working' },
  { value: 'completed', label: 'Completed' }
];

const contributorOptions = [
  { value: '1', label: '1 contributor' },
  { value: '2', label: '2 contributors' },
  { value: '3', label: '3 contributors' },
  { value: '4', label: '4 contributors' },
  { value: '5', label: '5 contributors' },
  { value: '10', label: '10 contributors' },
  { value: '0', label: 'No limit' }
];

// Common programming languages
const commonLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'R', 'MATLAB',
  'HTML', 'CSS', 'SQL', 'Shell', 'PowerShell', 'Lua', 'Perl', 'Haskell'
];

// Common programming skills
const commonSkills = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Django', 'Flask',
  'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET', 'FastAPI',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
  'React Native', 'Flutter', 'Electron', 'Unity', 'Unreal Engine',
  'Blockchain', 'Smart Contracts', 'Web3', 'Solidity',
  'DevOps', 'CI/CD', 'Git', 'Linux', 'Microservices', 'WebSockets',
  'Testing', 'Jest', 'Cypress', 'Selenium', 'JUnit'
];

const ProjectForm: React.FC = () => {
  const { addProject, currentUser } = useProjects();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    estimatedTime: '',
    maxContributors: '',
    showContributorCount: true,
    status: 'recruiting',
    showStatus: true,
    programmingLanguages: [] as string[],
    programmingSkills: [] as string[],
    currentLanguage: '',
    currentSkill: ''
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    difficulty: '',
    status: '',
    programmingLanguages: '',
    programmingSkills: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  const handleAddLanguage = () => {
    if (!formData.currentLanguage.trim()) return;
    
    // Check if language already exists
    if (formData.programmingLanguages.includes(formData.currentLanguage.trim())) {
      return;
    }
    
    setFormData({
      ...formData,
      programmingLanguages: [...formData.programmingLanguages, formData.currentLanguage.trim()],
      currentLanguage: ''
    });
    
    // Clear error if it exists
    if (errors.programmingLanguages) {
      setErrors({ ...errors, programmingLanguages: '' });
    }
  };

  const handleAddSkill = () => {
    if (!formData.currentSkill.trim()) return;
    
    // Check if skill already exists
    if (formData.programmingSkills.includes(formData.currentSkill.trim())) {
      return;
    }
    
    setFormData({
      ...formData,
      programmingSkills: [...formData.programmingSkills, formData.currentSkill.trim()],
      currentSkill: ''
    });
    
    // Clear error if it exists
    if (errors.programmingSkills) {
      setErrors({ ...errors, programmingSkills: '' });
    }
  };
  
  const handleRemoveLanguage = (languageToRemove: string) => {
    setFormData({
      ...formData,
      programmingLanguages: formData.programmingLanguages.filter(lang => lang !== languageToRemove)
    });
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      programmingSkills: formData.programmingSkills.filter(skill => skill !== skillToRemove)
    });
  };
  
  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLanguage();
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleQuickAddLanguage = (language: string) => {
    if (!formData.programmingLanguages.includes(language)) {
      setFormData({
        ...formData,
        programmingLanguages: [...formData.programmingLanguages, language]
      });
    }
  };

  const handleQuickAddSkill = (skill: string) => {
    if (!formData.programmingSkills.includes(skill)) {
      setFormData({
        ...formData,
        programmingSkills: [...formData.programmingSkills, skill]
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      difficulty: '',
      status: '',
      programmingLanguages: '',
      programmingSkills: ''
    };
    
    let isValid = true;
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
      isValid = false;
    }
    
    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select a difficulty level';
      isValid = false;
    }

    if (!formData.status) {
      newErrors.status = 'Please select a project status';
      isValid = false;
    }
    
    if (formData.programmingLanguages.length === 0) {
      newErrors.programmingLanguages = 'Add at least one programming language';
      isValid = false;
    }

    if (formData.programmingSkills.length === 0) {
      newErrors.programmingSkills = 'Add at least one programming skill';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const newProject = await addProject({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced',
        programmingLanguages: formData.programmingLanguages,
        programmingSkills: formData.programmingSkills,
        estimatedTime: formData.estimatedTime || undefined,
        maxContributors: formData.maxContributors ? parseInt(formData.maxContributors) : undefined,
        showContributorCount: formData.showContributorCount,
        status: formData.status as 'recruiting' | 'working' | 'completed',
        showStatus: formData.showStatus,
      });
      
      // Get the newly created project ID from the refreshed projects list
      // Since addProject refreshes the projects list, we need to find the project
      // by matching the title and creator (as a fallback approach)
      // The better approach would be to return the project ID from addProject
      
      // For now, navigate to home and let the user find their project
      // TODO: Modify addProject to return the created project ID
      navigate('/profile');
    } catch (error) {
      console.error('Error creating project:', error);
      setSubmitError('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {submitError}
        </div>
      )}

      <Input
        id="title"
        name="title"
        label="Project Title"
        placeholder="e.g., Weather Dashboard with React"
        value={formData.title}
        onChange={handleInputChange}
        error={errors.title}
        required
        disabled={isLoading}
      />
      
      <Textarea
        id="description"
        name="description"
        label="Project Description"
        placeholder="Describe your project idea in detail. Include potential features, technologies, and why it would be interesting to build."
        value={formData.description}
        onChange={handleInputChange}
        error={errors.description}
        required
        rows={6}
        disabled={isLoading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select
          id="difficulty"
          name="difficulty"
          label="Difficulty Level"
          options={difficultyOptions}
          value={formData.difficulty}
          onChange={handleInputChange}
          placeholder="Select difficulty"
          error={errors.difficulty}
          required
          disabled={isLoading}
        />

        <Select
          id="status"
          name="status"
          label="Project Status"
          options={statusOptions}
          value={formData.status}
          onChange={handleInputChange}
          placeholder="Select status"
          error={errors.status}
          required
          disabled={isLoading}
        />
        
        <Input
          id="estimatedTime"
          name="estimatedTime"
          label="Estimated Time (optional)"
          placeholder="e.g., 2-3 weeks"
          value={formData.estimatedTime}
          onChange={handleInputChange}
          disabled={isLoading}
        />

        <Select
          id="maxContributors"
          name="maxContributors"
          label="Max Contributors (optional)"
          options={contributorOptions}
          value={formData.maxContributors}
          onChange={handleInputChange}
          placeholder="Select limit"
          disabled={isLoading}
        />
      </div>

      {/* Project Status Visibility Toggle */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <ActivityIcon size={18} className="text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Project Status Settings</h4>
              <p className="text-sm text-blue-700 mt-1">
                The project status helps others understand the current phase of your project. 
                You can choose to show or hide this information from other users.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex items-center">
          <input
            type="checkbox"
            id="showStatus"
            name="showStatus"
            checked={formData.showStatus}
            onChange={handleCheckboxChange}
            disabled={isLoading}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showStatus" className="ml-2 text-sm text-blue-700 flex items-center">
            {formData.showStatus ? (
              <EyeIcon size={16} className="mr-1" />
            ) : (
              <EyeOffIcon size={16} className="mr-1" />
            )}
            {formData.showStatus 
              ? 'Show project status to other users' 
              : 'Hide project status from other users'
            }
          </label>
        </div>
      </div>

      {/* Contributor Count Visibility Toggle */}
      {formData.maxContributors && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <UsersIcon size={18} className="text-green-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">Contributor Settings</h4>
                <p className="text-sm text-green-700 mt-1">
                  {formData.maxContributors === '0' 
                    ? 'You\'ve set no limit on contributors. Anyone can request to contribute to this project.'
                    : `You're looking for up to ${formData.maxContributors} contributor${parseInt(formData.maxContributors) > 1 ? 's' : ''} for this project. Once this limit is reached, new contribution requests will be disabled.`
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="showContributorCount"
              name="showContributorCount"
              checked={formData.showContributorCount}
              onChange={handleCheckboxChange}
              disabled={isLoading}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="showContributorCount" className="ml-2 text-sm text-green-700 flex items-center">
              {formData.showContributorCount ? (
                <EyeIcon size={16} className="mr-1" />
              ) : (
                <EyeOffIcon size={16} className="mr-1" />
              )}
              {formData.showContributorCount 
                ? 'Show contributor count to other users' 
                : 'Hide contributor count from other users'
              }
            </label>
          </div>
        </div>
      )}
      
      {/* Programming Languages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Programming Languages
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="flex mb-2">
          <Input
            id="currentLanguage"
            name="currentLanguage"
            placeholder="Add a programming language (e.g., JavaScript, Python)"
            value={formData.currentLanguage}
            onChange={handleInputChange}
            onKeyDown={handleLanguageKeyDown}
            error=""
            className="mb-0 flex-grow"
            disabled={isLoading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddLanguage}
            className="ml-2"
            icon={<PlusCircleIcon size={18} />}
            disabled={isLoading}
          >
            Add
          </Button>
        </div>

        {/* Quick add popular languages */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Popular languages:</p>
          <div className="flex flex-wrap gap-1">
            {commonLanguages.slice(0, 8).map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => handleQuickAddLanguage(language)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  formData.programmingLanguages.includes(language)
                    ? 'bg-indigo-100 text-indigo-800 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={formData.programmingLanguages.includes(language) || isLoading}
              >
                {language}
              </button>
            ))}
          </div>
        </div>
        
        {errors.programmingLanguages && (
          <p className="mt-1 text-sm text-red-600">{errors.programmingLanguages}</p>
        )}
        
        {formData.programmingLanguages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.programmingLanguages.map((language) => (
              <div 
                key={language} 
                className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center"
              >
                {language}
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(language)}
                  className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                  disabled={isLoading}
                >
                  <XCircleIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Programming Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Programming Skills & Technologies
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="flex mb-2">
          <Input
            id="currentSkill"
            name="currentSkill"
            placeholder="Add a skill or technology (e.g., React, Docker, Machine Learning)"
            value={formData.currentSkill}
            onChange={handleInputChange}
            onKeyDown={handleSkillKeyDown}
            error=""
            className="mb-0 flex-grow"
            disabled={isLoading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSkill}
            className="ml-2"
            icon={<PlusCircleIcon size={18} />}
            disabled={isLoading}
          >
            Add
          </Button>
        </div>

        {/* Quick add popular skills */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Popular skills:</p>
          <div className="flex flex-wrap gap-1">
            {commonSkills.slice(0, 10).map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => handleQuickAddSkill(skill)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  formData.programmingSkills.includes(skill)
                    ? 'bg-emerald-100 text-emerald-800 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={formData.programmingSkills.includes(skill) || isLoading}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        
        {errors.programmingSkills && (
          <p className="mt-1 text-sm text-red-600">{errors.programmingSkills}</p>
        )}
        
        {formData.programmingSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.programmingSkills.map((skill) => (
              <div 
                key={skill} 
                className="bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1.5 text-emerald-600 hover:text-emerald-800"
                  disabled={isLoading}
                >
                  <XCircleIcon size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/home')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Project...' : 'Submit Project Idea'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;