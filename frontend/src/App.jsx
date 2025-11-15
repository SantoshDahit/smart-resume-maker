import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FileText, Briefcase, BarChart3, Home, FolderOpen } from 'lucide-react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import ResumeBuilder from './pages/ResumeBuilder';
import JobDescriptions from './pages/JobDescriptions';
import MatchingPage from './pages/MatchingPage';
import ResumeList from './pages/ResumeList';

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/resumes', icon: FolderOpen, label: 'My Resumes' },
    { path: '/upload', icon: FileText, label: 'Upload Resume' },
    { path: '/job-descriptions', icon: Briefcase, label: 'Job Descriptions' },
    { path: '/matching', icon: BarChart3, label: 'Matching' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">
                Smart Resume Builder
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resumes" element={<ResumeList />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/resume/:id" element={<ResumeBuilder />} />
          <Route path="/job-descriptions" element={<JobDescriptions />} />
          <Route path="/matching" element={<MatchingPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Smart Resume Builder - Undergraduate Thesis Project by Santosh
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
