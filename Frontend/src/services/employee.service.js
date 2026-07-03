import api from './api';

const employeeService = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  add: (data) => api.post('/employees', data),
  updateStatus: (id, status) => api.patch(`/employees/${id}/status`, { status }),
};

export default employeeService;
