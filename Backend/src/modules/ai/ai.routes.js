const express = require('express');
const aiController = require('./ai.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Only SUPER_ADMIN, ADMIN, HR_MANAGER, DEPARTMENT_MANAGER can access AI Summary
router.get('/', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), aiController.getOrganizationSummary);
router.get('/search', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), aiController.searchEmployeeSummary);
router.get('/:employeeId', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), aiController.getEmployeeSummaryById);

module.exports = router;
