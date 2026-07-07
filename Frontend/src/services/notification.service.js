import api from './api';

const getMyNotifications = () => {
  return api.get('/notifications/my-notifications');
};

const markAsRead = (id) => {
  return api.put(`/notifications/mark-read/${id}`);
};

const notificationService = {
  getMyNotifications,
  markAsRead
};

export default notificationService;
