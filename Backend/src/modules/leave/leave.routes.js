const express = require('express');
const router = express.Router();
const leaveController = require('./leave.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

router.use(authenticate);

router.post('/apply', authorize(['EMPLOYEE']), leaveController.applyLeave);
router.get('/my-leaves', authorize(['EMPLOYEE']), leaveController.getMyLeaves);

router.get('/all', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), leaveController.getAllLeaves);
router.put('/status/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), leaveController.updateStatus);

module.exports = router;
