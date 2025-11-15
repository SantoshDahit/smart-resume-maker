import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Resume APIs
export const resumeAPI = {
  // Upload resume file
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Create resume manually
  createResume: (resumeData) => {
    return api.post('/resumes/create', resumeData);
  },

  // Get all resumes
  getAllResumes: () => {
    return api.get('/resumes');
  },

  // Get single resume
  getResume: (id) => {
    return api.get(`/resumes/${id}`);
  },

  // Update resume
  updateResume: (id, resumeData) => {
    return api.put(`/resumes/${id}`, resumeData);
  },

  // Delete resume
  deleteResume: (id) => {
    return api.delete(`/resumes/${id}`);
  },

  // Match with job description
  matchWithJD: (resumeId, jdId) => {
    return api.post(`/resumes/${resumeId}/match?jdId=${jdId}`);
  },

  // Optimize resume
  optimizeResume: (resumeId, jdId) => {
    return api.post(`/resumes/${resumeId}/optimize?jdId=${jdId}`);
  },

  // Get optimization suggestions
  getOptimizationSuggestions: (resumeId, jdId) => {
    return api.get(`/resumes/${resumeId}/optimization-suggestions?jdId=${jdId}`);
  },

  // Download PDF
  downloadPDF: (resumeId, template = 'classic') => {
    return api.get(`/resumes/${resumeId}/download?template=${template}`, {
      responseType: 'blob',
    });
  },
};

// Job Description APIs
export const jobDescriptionAPI = {
  // Create job description
  createJobDescription: (description) => {
    return api.post('/job-descriptions', { description });
  },

  // Get all job descriptions
  getAllJobDescriptions: () => {
    return api.get('/job-descriptions');
  },

  // Get single job description
  getJobDescription: (id) => {
    return api.get(`/job-descriptions/${id}`);
  },

  // Update job description
  updateJobDescription: (id, description) => {
    return api.put(`/job-descriptions/${id}`, { description });
  },

  // Delete job description
  deleteJobDescription: (id) => {
    return api.delete(`/job-descriptions/${id}`);
  },

  // Update job title only
  updateJobTitle: (id, title) => {
    return api.put(`/job-descriptions/${id}/title`, { title });
  },
};

export default api;
