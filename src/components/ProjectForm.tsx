import React, { useState } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import Button from './ui/Button';
import { useProjects } from '../context/ProjectContext';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, PlusCircleIcon } from 'lucide-react';

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const ProjectForm: React.FC = () => {
  const { addProject, currentUser } = useProjects();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    estimatedTime: '',
    tags: [] as string[],
    currentTag: ''
  });
  
  const [errors, setErrors] = useState({
    title: '',
    description: '',
    difficulty: '',
    tags: ''
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleAddTag = () => {
    if (!formData.currentTag.trim()) return;
    
    // Check if tag already exists
    if (formData.tags.includes(formData.currentTag.trim().toLowerCase())) {
      return;
    }
    
    setFormData({
      ...formData,
      tags: [...formData.tags, formData.currentTag.trim().toLowerCase()],
      currentTag: ''
    });
    
    // Clear tag error if it exists
    if (errors.tags) {
      setErrors({ ...errors, tags: '' });
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const validateForm = () => {
    const newErrors = {
      title: '',
      description: '',
      difficulty: '',
      tags: ''
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
    
    if (formData.tags.length === 0) {
      newErrors.tags = 'Add at least one tag';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    addProject({
      title: formData.title,
      description: formData.description,
      difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced',
      tags: formData.tags,
      estimatedTime: formData.estimatedTime || undefined,
      createdBy: currentUser
    });
    
    navigate('/');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        name="title"
        label="Project Title"
        placeholder="e.g., Weather Dashboard with React"
        value={formData.title}
        onChange={handleInputChange}
        error={errors.title}
        required
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
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        />
        
        <Input
          id="estimatedTime"
          name="estimatedTime"
          label="Estimated Time to Complete (optional)"
          placeholder="e.g., 2-3 weeks"
          value={formData.estimatedTime}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="flex">
          <Input
            id="currentTag"
            name="currentTag"
            placeholder="Add a tag (e.g., react, web, api)"
            value={formData.currentTag}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            error=""
            className="mb-0 flex-grow"
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            className="ml-2"
            icon={<PlusCircleIcon size={18} />}
          >
            Add
          </Button>
        </div>
        
        {errors.tags && (
          <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
        )}
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag) => (
              <div 
                key={tag} 
                className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-gray-500 hover:text-gray-700"
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
          onClick={() => navigate('/')}
        >
          Cancel
        </Button>
        
        <Button
          type="submit"
          variant="primary"
        >
          Submit Project Idea
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;