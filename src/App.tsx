import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NewProjectPage from './pages/NewProjectPage';

function App() {
  return (
    <ProjectProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/project/:id" element={<ProjectDetailPage />} />
              <Route path="/new-project" element={<NewProjectPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500">
                © {new Date().getFullYear()} CodeIdeas · Find your next coding project
              </p>
            </div>
          </footer>
        </div>
      </Router>
    </ProjectProvider>
  );
}

export default App;