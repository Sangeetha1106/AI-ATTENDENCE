const Notification = require('./notification.model');

const getMyNotifications = async (user) => {
  return await Notification.findAll({
    where: { userId: user.id },
    order: [['createdAt', 'DESC']]
  });
};

const markAsRead = async (user, id) => {
  const notification = await Notification.findOne({
    where: { id, userId: user.id }
  });
  
  if (!notification) throw new Error('Notification not found');
  
  notification.isRead = true;
  await notification.save();
  return notification;
};

module.exports = {
  getMyNotifications,
  markAsRead
};
