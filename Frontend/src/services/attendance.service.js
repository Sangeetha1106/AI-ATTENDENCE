import api from './api';

const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  getByEmployee: (id) => api.get(`/attendance/employee/${id}`),
  getByDate: (date) => api.get(`/attendance/date/${date}`),
  getByMonth: (year, month) => api.get(`/attendance/month/${year}/${month}`),
  getByYear: (year) => api.get(`/attendance/year/${year}`),
  mark: (data) => api.post('/attendance', data),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  logError: (data) => api.post('/attendance/log-error', data),
};

export default attendanceService;
