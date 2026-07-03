const express = require('express');
const reportController = require('./report.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

const allRoles = ['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE'];

router.get('/daily', authorize(allRoles), reportController.getDaily);
router.get('/monthly', authorize(allRoles), reportController.getMonthly);
router.get('/yearly', authorize(allRoles), reportController.getYearly);

module.exports = router;
