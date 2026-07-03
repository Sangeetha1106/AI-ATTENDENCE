import api from './api';

const reportService = {
  getDaily: (date) => api.get(`/reports/daily${date ? `?date=${date}` : ''}`),
  getMonthly: (year, month) => api.get(`/reports/monthly${year ? `?year=${year}&month=${month}` : ''}`),
  getYearly: (year) => api.get(`/reports/yearly${year ? `?year=${year}` : ''}`),
};

export default reportService;
