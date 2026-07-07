const express = require('express');
const router = express.Router();
const onDutyController = require('./onduty.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

router.use(authenticate);

router.post('/apply', authorize(['EMPLOYEE']), onDutyController.applyOnDuty);
router.get('/my-onduty', authorize(['EMPLOYEE']), onDutyController.getMyOnDuty);

router.get('/all', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), onDutyController.getAllOnDuty);
router.put('/status/:id', authorize(['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), onDutyController.updateStatus);

module.exports = router;
