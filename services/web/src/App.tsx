import React from 'react';
import IncidentTable from './components/IncidentTable';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">DevOps Incident Center</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Dashboard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Incident Dashboard</h2>
            <p className="mt-1 text-sm text-gray-600">
              Monitor and manage your infrastructure incidents
            </p>
          </div>
          
          <IncidentTable />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            DevOps Incident Center - Self-hosted incident management for engineering teams
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
