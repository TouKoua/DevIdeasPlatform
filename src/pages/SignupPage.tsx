import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useProjects } from '../context/ProjectContext';
import { UserPlusIcon, GithubIcon } from 'lucide-react';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useProjects(); // Removed signInWithGitHub
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGitHubSignIn = async () => {
  //   setError('');
  //   setIsGitHubLoading(true);

  //   try {
  //     await signInWithGitHub();
  //     // Navigation will be handled by the OAuth redirect
  //   } catch (err: any) {
  //     setError(err.message || 'Failed to sign up with GitHub');
  //     setIsGitHubLoading(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* GitHub Sign Up - COMMENTED OUT */}
          {/* <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              icon={<GithubIcon size={20} />}
              onClick={handleGitHubSignIn}
              disabled={isGitHubLoading || isLoading}
            >
              {isGitHubLoading ? 'Creating account...' : 'Continue with GitHub'}
            </Button>
          </div> */}

          {/* Divider - COMMENTED OUT */}
          {/* <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div> */}

          {/* Email/Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="name"
              name="name"
              type="text"
              label="Full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />

            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              icon={<UserPlusIcon size={20} />}
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;