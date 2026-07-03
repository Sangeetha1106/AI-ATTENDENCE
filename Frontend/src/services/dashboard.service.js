import api from './api';

const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getToday: () => api.get('/dashboard/today'),
  getMonthly: () => api.get('/dashboard/monthly'),
  getYearly: () => api.get('/dashboard/yearly'),
};

export default dashboardService;
