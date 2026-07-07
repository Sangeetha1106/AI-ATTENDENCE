const express = require('express');
const employeeController = require('./employee.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

// All employee routes are protected
router.use(authenticate);

// Add Employee API (ADMIN)
router.post('/', authorize(['ADMIN']), employeeController.addEmployee);

// Get All Employees API (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER)
router.get('/', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), employeeController.getAllEmployees);

// Get Employee By ID API (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, EMPLOYEE)
router.get('/search', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), employeeController.searchEmployeeByName);

// Get Logged-in Employee Profile
router.get('/me', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), employeeController.getMe);

// Get Employee By ID API (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, EMPLOYEE)
router.get('/:id', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), employeeController.getEmployeeById);

// Update Employee Status API (ADMIN)
router.patch('/:id/status', authorize(['ADMIN']), employeeController.updateEmployeeStatus);

// API Security Requirements (Return 403 for non-admins)
router.put('/', authorize(['ADMIN']), (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
router.delete('/', authorize(['ADMIN']), (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
router.put('/:id', authorize(['ADMIN']), (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));
router.delete('/:id', authorize(['ADMIN']), (req, res) => res.status(405).json({ message: 'Method Not Allowed' }));

module.exports = router;
