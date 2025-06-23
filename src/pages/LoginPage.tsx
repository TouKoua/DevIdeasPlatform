import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useProjects } from '../context/ProjectContext';
import { LogInIcon, GithubIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signInWithGitHub } = useProjects();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('LoginPage: handleSubmit - Start. isLoading:', true);
    console.log('LoginPage: Form data:', { email: formData.email, password: '[REDACTED]' });

    try {
      console.log('LoginPage: Calling login from ProjectContext...');
      const startTime = Date.now();
      
      await login(formData.email, formData.password);
      
      const endTime = Date.now();
      console.log(`LoginPage: login from ProjectContext resolved in ${endTime - startTime}ms`);
      
      console.log('LoginPage: Initiating navigation to /home...');
      navigate('/home');
      console.log('LoginPage: Navigation to /home completed.');
    } catch (err: any) {
      console.error('LoginPage: Login error caught:', err);
      console.error('LoginPage: Error details:', {
        message: err.message,
        code: err.code,
        status: err.status
      });
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
      console.log('LoginPage: handleSubmit - End. isLoading:', false);
    }
  };

  const handleGitHubSignIn = async () => {
    setError('');
    setIsGitHubLoading(true);
    console.log('LoginPage: GitHub sign in initiated...');

    try {
      await signInWithGitHub();
      console.log('LoginPage: GitHub sign in completed.');
      // Navigation will be handled by the OAuth redirect
    } catch (err: any) {
      console.error('LoginPage: GitHub sign in error:', err);
      setError(err.message || 'Failed to sign in with GitHub');
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
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

          {/* GitHub Sign In */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              icon={<GithubIcon size={20} />}
              onClick={handleGitHubSignIn}
              disabled={isGitHubLoading || isLoading}
            >
              {isGitHubLoading ? 'Signing in...' : 'Continue with GitHub'}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading || isGitHubLoading}
            />

            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading || isGitHubLoading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              icon={<LogInIcon size={20} />}
              disabled={isLoading || isGitHubLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;