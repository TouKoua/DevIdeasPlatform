import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from './ui/Button';
import { useProjects } from '../context/ProjectContext';
import { 
  MenuIcon, 
  XIcon, 
  PlusSquareIcon, 
  SearchIcon, 
  CodeIcon,
  LogOutIcon,
  LogInIcon,
  UserPlusIcon
} from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, logout } = useProjects();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CodeIcon size={28} className="text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">CodeIdeas</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Explore
              </Link>
              <Link to="/trending" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Trending
              </Link>
              <Link to="/categories" className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Categories
              </Link>
            </nav>
          </div>
          
          {/* Search and actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm"
                onFocus={() => navigate('/search')}
              />
            </div>
            
            {currentUser ? (
              <>
                <Button 
                  variant="primary" 
                  size="md"
                  icon={<PlusSquareIcon size={18} />}
                  onClick={() => navigate('/new-project')}
                >
                  Post Idea
                </Button>
                
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="md"
                    icon={<LogOutIcon size={18} />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="md"
                  icon={<LogInIcon size={18} />}
                  onClick={() => navigate('/login')}
                >
                  Sign in
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={<UserPlusIcon size={18} />}
                  onClick={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link 
              to="/trending" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Trending
            </Link>
            <Link 
              to="/categories" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              to="/search" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
            
            {currentUser ? (
              <>
                <Link 
                  to="/new-project" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-700 bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post Idea
                </Link>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 hover:bg-indigo-700 bg-indigo-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;