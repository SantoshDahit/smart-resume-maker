import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Trash2, Edit, Download, Loader, Plus } from 'lucide-react';
import { resumeAPI } from '../services/api';

export default function ResumeList() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getAllResumes();
      setResumes(response.data);
    } catch (err) {
      setError('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    
    try {
      await resumeAPI.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete resume');
    }
  };

  const handleDownload = async (id, name) => {
    try {
      const response = await resumeAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${name.replace(/\s+/g, '_')}_resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download resume');
    }
  };

  const handleCreateNew = async () => {
    try {
      // Create a blank resume
      const response = await resumeAPI.createResume({
        name: 'New Resume',
        email: '',
        phone: '',
        summary: '',
        experience: '',
        education: '',
        skills: '',
        projects: '',
        certifications: '',
        template: 'classic'
      });
      
      // Navigate to the editor for the new resume
      navigate(`/resume/${response.data.id}`);
    } catch (err) {
      alert('Failed to create new resume');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Resume
          </button>
          <Link
            to="/upload"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <FileText className="h-5 w-5 mr-2" />
            Upload Resume
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No resumes yet</h2>
          <p className="text-gray-600 mb-6">
            Create a new resume from scratch or upload an existing one
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCreateNew}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Resume
            </button>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              Upload Resume
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-indigo-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-lg">{resume.name || 'Untitled'}</h3>
                    <p className="text-sm text-gray-500">{resume.email}</p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <p className="mb-1">
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(resume.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex space-x-2">
                <Link
                  to={`/resume/${resume.id}`}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md text-sm text-center hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
                <button
                  onClick={() => handleDownload(resume.id, resume.name)}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
