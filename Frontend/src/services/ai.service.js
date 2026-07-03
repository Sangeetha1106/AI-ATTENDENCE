import api from './api';

const aiService = {
  generateSummary: () => api.post('/ai/generate-summary'),
  generateEmployeeSummary: (name) => api.post('/ai/employee-summary', { name })
};

export default aiService;
