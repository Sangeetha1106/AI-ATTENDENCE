const express = require('express');
const departmentController = require('./department.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Create Department (ADMIN only)
router.post('/', authorize(['ADMIN']), departmentController.createDepartment);

// Get All Departments (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER)
router.get('/', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), departmentController.getAllDepartments);

// Get Department By ID (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER)
router.get('/:id', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), departmentController.getDepartmentById);

// Update Department (ADMIN only)
router.put('/:id', authorize(['ADMIN']), departmentController.updateDepartment);

module.exports = router;
