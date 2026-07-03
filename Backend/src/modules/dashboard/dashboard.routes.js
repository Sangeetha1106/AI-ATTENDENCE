const express = require('express');
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

const allRoles = ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'];

router.get('/summary', authorize(allRoles), dashboardController.getSummary);
router.get('/today', authorize(allRoles), dashboardController.getToday);
router.get('/monthly', authorize(allRoles), dashboardController.getMonthly);
router.get('/yearly', authorize(allRoles), dashboardController.getYearly);

module.exports = router;
