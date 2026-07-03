const express = require('express');
const employeeController = require('./employee.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

// All employee routes are protected
router.use(authenticate);

// Add Employee API (ADMIN, HR_MANAGER)
router.post('/', authorize(['ADMIN', 'HR_MANAGER']), employeeController.addEmployee);

// Get All Employees API (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER)
router.get('/', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), employeeController.getAllEmployees);

// Get Employee By ID API (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, EMPLOYEE)
router.get('/:id', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), employeeController.getEmployeeById);

// Update Employee Status API (ADMIN, HR_MANAGER)
router.patch('/:id/status', authorize(['ADMIN', 'HR_MANAGER']), employeeController.updateEmployeeStatus);

module.exports = router;
