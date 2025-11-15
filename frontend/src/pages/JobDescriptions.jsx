import React, { useState, useEffect } from 'react';
import { Briefcase, PlusCircle, Trash2, Edit2, Check, X } from 'lucide-react';
import { jobDescriptionAPI } from '../services/api';

function JobDescriptions() {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState('');
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  useEffect(() => {
    fetchJobDescriptions();
  }, []);

  const fetchJobDescriptions = async () => {
    try {
      const response = await jobDescriptionAPI.getAllJobDescriptions();
      setJds(response.data);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.trim()) {
      alert('Please enter a job description');
      return;
    }

    try {
      if (editingId) {
        await jobDescriptionAPI.updateJobDescription(editingId, formData);
        alert('Job description updated successfully!');
      } else {
        await jobDescriptionAPI.createJobDescription(formData);
        alert('Job description created successfully!');
      }
      
      setFormData('');
      setShowForm(false);
      setEditingId(null);
      fetchJobDescriptions();
    } catch (error) {
      console.error('Error saving job description:', error);
      alert('Failed to save job description');
    }
  };

  const handleEdit = (jd) => {
    setEditingId(jd.id);
    setFormData(jd.description);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job description?')) {
      try {
        await jobDescriptionAPI.deleteJobDescription(id);
        fetchJobDescriptions();
      } catch (error) {
        console.error('Error deleting job description:', error);
        alert('Failed to delete job description');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData('');
  };

  const handleTitleEdit = (jd) => {
    setEditingTitleId(jd.id);
    setEditingTitleValue(jd.jobTitle || '');
  };

  const handleTitleSave = async (id) => {
    try {
      console.log('Updating title for JD:', id, 'New title:', editingTitleValue);
      
      // Update only the title using the new API endpoint
      const response = await jobDescriptionAPI.updateJobTitle(id, editingTitleValue);
      console.log('Update response:', response.data);
      
      // Update local state
      setJds(jds.map(j => j.id === id ? { ...j, jobTitle: editingTitleValue } : j));
      
      setEditingTitleId(null);
      setEditingTitleValue('');
      
      console.log('Title updated successfully');
    } catch (error) {
      console.error('Error updating job title:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to update job title: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTitleCancel = () => {
    setEditingTitleId(null);
    setEditingTitleValue('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Descriptions</h1>
          <p className="text-gray-600">Manage job descriptions for matching with resumes</p>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add New JD</span>
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Job Description' : 'Add New Job Description'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
                className="textarea"
                rows="15"
                placeholder="Paste the complete job description here...&#10;&#10;Example:&#10;We are looking for a Senior Software Engineer with 5+ years experience in Java, Spring Boot, microservices, Docker, Kubernetes, and AWS.&#10;&#10;Required Skills:&#10;- Java, Spring Boot&#10;- Microservices architecture&#10;- Docker, Kubernetes&#10;- AWS cloud services&#10;&#10;Responsibilities:&#10;- Design and develop scalable applications&#10;- Lead development teams..."
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Paste the complete job description. Our AI will automatically extract required skills, responsibilities, and other key information.
              </p>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update' : 'Create'} Job Description
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Job Descriptions List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Job Descriptions</h2>
          <span className="text-sm text-gray-500">{jds.length} job descriptions</span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Loading job descriptions...</p>
          </div>
        ) : jds.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No job descriptions yet</p>
            <p className="text-gray-400 text-sm mt-2">Add a job description to start matching with resumes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jds.map((jd) => (
              <div
                key={jd.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      {editingTitleId === jd.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            className="flex-1 px-3 py-1 border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            onClick={() => handleTitleSave(jd.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleTitleCancel}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {jd.jobTitle || 'Job Position'}
                          </h3>
                          <button
                            onClick={() => handleTitleEdit(jd)}
                            className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Edit title"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    {jd.companyName && (
                      <p className="text-sm text-gray-600 mb-2">{jd.companyName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Created: {new Date(jd.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(jd)}
                      className="btn-secondary py-2 px-3"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(jd.id)}
                      className="btn-danger py-2 px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {jd.requiredSkills && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Required Skills:
                      </h4>
                      <p className="text-sm text-gray-600">{jd.requiredSkills}</p>
                    </div>
                  )}

                  {jd.preferredSkills && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Preferred Skills:
                      </h4>
                      <p className="text-sm text-gray-600">{jd.preferredSkills}</p>
                    </div>
                  )}

                  {jd.responsibilities && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Key Responsibilities:
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {jd.responsibilities}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                      Full Description:
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {jd.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-600">
            Automatically extracts required skills and key requirements
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Easy Management</h3>
          <p className="text-sm text-gray-600">
            Store and manage multiple job descriptions
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Edit2 className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Match & Optimize</h3>
          <p className="text-sm text-gray-600">
            Use JDs to match and optimize your resumes
          </p>
        </div>
      </div>
    </div>
  );
}

export default JobDescriptions;
