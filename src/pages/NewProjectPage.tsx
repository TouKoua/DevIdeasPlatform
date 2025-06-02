import React from 'react';
import ProjectForm from '../components/ProjectForm';

const NewProjectPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Share Your Project Idea</h1>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <ProjectForm />
      </div>
    </div>
  );
};

export default NewProjectPage;