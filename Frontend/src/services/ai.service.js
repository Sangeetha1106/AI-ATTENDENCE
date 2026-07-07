import api from './api';

const aiService = {
  generateSummary: () => api.get('/ai'),
  generateEmployeeSummary: (name) => api.get(`/ai/search?name=${encodeURIComponent(name)}`)
};

export default aiService;
