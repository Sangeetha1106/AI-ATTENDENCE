const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

router.use(authenticate);

router.get('/my-notifications', notificationController.getMyNotifications);
router.put('/mark-read/:id', notificationController.markAsRead);

module.exports = router;
