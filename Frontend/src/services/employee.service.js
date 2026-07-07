import api from './api';

const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  search: (name) => api.get(`/employees/search?name=${encodeURIComponent(name)}`),
  getMe: () => api.get('/employees/me'),
  add: (data) => api.post('/employees', data),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }),
};

export default employeeService;
