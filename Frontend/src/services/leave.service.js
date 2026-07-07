import api from './api';

const applyLeave = (data) => {
  return api.post('/leave/apply', data);
};

const getMyLeaves = () => {
  return api.get('/leave/my-leaves');
};

const getAllLeaves = () => {
  return api.get('/leave/all');
};

const updateStatus = (id, status) => {
  return api.put(`/leave/status/${id}`, { status });
};

const leaveService = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateStatus
};

export default leaveService;
