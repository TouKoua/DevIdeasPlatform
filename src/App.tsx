import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/Header';
import ProjectsSidebar from './components/ProjectsSidebar';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NewProjectPage from './pages/NewProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import ContributionRequestsPage from './pages/ContributionRequestsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import SettingsPage from './pages/SettingsPage';
import { useProjects } from './context/ProjectContext';
import { ZapIcon } from 'lucide-react';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useProjects();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useProjects();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {currentUser && <ProjectsSidebar />}
        <main className={`flex-1 ${currentUser ? 'ml-0' : ''}`}>
          {children}
        </main>
      </div>
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-3">
            <p className="text-center text-gray-500">
              © {new Date().getFullYear()} CodeIdeas · Find your next coding project
            </p>
            <a
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors duration-200 group"
            >
              <ZapIcon size={14} className="mr-1.5 group-hover:scale-110 transition-transform duration-200" />
              Built with Bolt
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Routes>
          <Route path="/home" element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          } />
          <Route path="/" element={
            <AppLayout>
              <LandingPage />
            </AppLayout>
          } />
          <Route path="/login" element={
            <AppLayout>
              <LoginPage />
            </AppLayout>
          } />
          <Route path="/signup" element={
            <AppLayout>
              <SignupPage />
            </AppLayout>
          } />
          <Route path="/search" element={
            <AppLayout>
              <SearchPage />
            </AppLayout>
          } />
          <Route path="/project/:id" element={
            <AppLayout>
              <ProjectDetailPage />
            </AppLayout>
          } />
          <Route 
            path="/project/:id/edit" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <EditProjectPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/project/:id/contributions" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <ContributionRequestsPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/new-project" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <NewProjectPage />
                </AppLayout>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <ProfilePage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <AppLayout>
                  <SettingsPage />
                </AppLayout>
              </PrivateRoute>
            }
          />
          {/* Both /user/:userId and /public-profile/:userId routes use PublicProfilePage */}
          <Route path="/user/:userId" element={
            <AppLayout>
              <PublicProfilePage />
            </AppLayout>
          } />
          <Route path="/public-profile/:userId" element={
            <AppLayout>
              <PublicProfilePage />
            </AppLayout>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ProjectProvider>
  );
}

export default App;