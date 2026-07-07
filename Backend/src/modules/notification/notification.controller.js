const notificationService = require('./notification.service');

const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getMyNotifications(req.user);
    res.status(200).json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(req.user, id);
    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead
};
