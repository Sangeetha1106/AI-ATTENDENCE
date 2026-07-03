const express = require('express');
const aiController = require('./ai.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Only ADMIN, HR_MANAGER, DEPARTMENT_MANAGER can access AI Summary
router.post('/generate-summary', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), aiController.generateSummary);
router.post('/employee-summary', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), aiController.generateEmployeeSummary);

module.exports = router;
