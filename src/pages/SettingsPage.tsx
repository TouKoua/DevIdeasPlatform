import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Button from '../components/ui/Button';
import { 
  ArrowLeftIcon, 
  SaveIcon, 
  UserIcon, 
  MapPinIcon, 
  GlobeIcon, 
  GithubIcon, 
  TwitterIcon,
  CameraIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { currentUser, updateUserProfile } = useProjects();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    twitter: '',
    avatar: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    website: '',
    github: '',
    twitter: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        bio: currentUser.bio || '',
        location: currentUser.location || '',
        website: currentUser.website || '',
        github: currentUser.github || '',
        twitter: currentUser.twitter || '',
        avatar: currentUser.avatar || ''
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <UserIcon size={64} className="mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
        <p className="text-gray-600 mb-6">You need to be signed in to access your settings.</p>
        <Link to="/login">
          <Button variant="primary">Sign in</Button>
        </Link>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Clear messages
    setSaveMessage('');
    setSaveError('');
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      website: '',
      github: '',
      twitter: ''
    };
    
    let isValid = true;
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate website URL
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
      isValid = false;
    }
    
    // Validate GitHub username (no @ symbol, no spaces)
    if (formData.github && !/^[a-zA-Z0-9-]+$/.test(formData.github)) {
      newErrors.github = 'GitHub username can only contain letters, numbers, and hyphens';
      isValid = false;
    }
    
    // Validate Twitter username (no @ symbol, no spaces)
    if (formData.twitter && !/^[a-zA-Z0-9_]+$/.test(formData.twitter)) {
      newErrors.twitter = 'Twitter username can only contain letters, numbers, and underscores';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSaveMessage('');
    setSaveError('');
    
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        website: formData.website.trim() || undefined,
        github: formData.github.trim() || undefined,
        twitter: formData.twitter.trim() || undefined,
        avatar: formData.avatar.trim() || undefined
      });
      
      setSaveMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, avatar: url });
    setSaveMessage('');
    setSaveError('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => navigate('/profile')}
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeftIcon size={18} className="mr-2" />
        Back to Profile
      </button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-indigo-100 mt-1">Update your personal information and preferences</p>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {saveMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md flex items-center">
              <CheckCircleIcon size={18} className="mr-2" />
              {saveMessage}
            </div>
          )}

          {saveError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircleIcon size={18} className="mr-2" />
              {saveError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={formData.avatar || currentUser.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <CameraIcon size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Input
                    id="avatar"
                    name="avatar"
                    type="url"
                    label="Avatar URL"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.avatar}
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a URL to your profile picture. We recommend using a square image for best results.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                  required
                  disabled={isLoading}
                />
                
                <Input
                  id="location"
                  name="location"
                  label="Location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  icon={<MapPinIcon size={18} />}
                />
              </div>
              
              <Textarea
                id="bio"
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself, your interests, and what you're working on..."
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Write a short bio to help others learn about you and your interests.
              </p>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Social Links</h3>
              <div className="space-y-4">
                <Input
                  id="website"
                  name="website"
                  type="url"
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  error={errors.website}
                  disabled={isLoading}
                  icon={<GlobeIcon size={18} />}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      id="github"
                      name="github"
                      label="GitHub Username"
                      placeholder="yourusername"
                      value={formData.github}
                      onChange={handleInputChange}
                      error={errors.github}
                      disabled={isLoading}
                      icon={<GithubIcon size={18} />}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Just your username, not the full URL
                    </p>
                  </div>
                  
                  <div>
                    <Input
                      id="twitter"
                      name="twitter"
                      label="Twitter Username"
                      placeholder="yourusername"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      error={errors.twitter}
                      disabled={isLoading}
                      icon={<TwitterIcon size={18} />}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Without the @ symbol
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                icon={<SaveIcon size={18} />}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircleIcon size={18} className="text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Privacy Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your profile information will be visible to other users on the platform. 
              Only share information you're comfortable making public.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;