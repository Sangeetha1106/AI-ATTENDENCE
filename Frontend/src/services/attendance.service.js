import api from './api';

const attendanceService = {
  getAll: () => api.get('/attendance'),
  getByEmployee: (id) => api.get(`/attendance/employee/${id}`),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  getByMonth: (year, month) => api.get(`/attendance/month/${year}/${month}`),
  getByYear: (year) => api.get(`/attendance/year/${year}`),
  mark: (data) => api.post('/attendance', data),
};

export default attendanceService;
