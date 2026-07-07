import api from './api';

const applyOnDuty = (data) => {
  return api.post('/onduty/apply', data);
};

const getMyOnDuty = () => {
  return api.get('/onduty/my-onduty');
};

const getAllOnDuty = () => {
  return api.get('/onduty/all');
};

const updateStatus = (id, status) => {
  return api.put(`/onduty/status/${id}`, { status });
};

const onDutyService = {
  applyOnDuty,
  getMyOnDuty,
  getAllOnDuty,
  updateStatus
};

export default onDutyService;
