const express = require('express');
const attendanceController = require('./attendance.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

// Mark Attendance (ADMIN, HR_MANAGER, DEPARTMENT_MANAGER)
router.post('/', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), attendanceController.markAttendance);

// Get All Attendance
router.get('/', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']), attendanceController.getAllAttendance);

// Get Attendance By Employee
router.get('/employee/:employeeId', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), attendanceController.getAttendanceByEmployee);

// Get Attendance By Date
router.get('/date/:date', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), attendanceController.getAttendanceByDate);

// Get Attendance By Month
router.get('/month/:year/:month', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), attendanceController.getAttendanceByMonth);

// Get Attendance By Year
router.get('/year/:year', authorize(['ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE']), attendanceController.getAttendanceByYear);

module.exports = router;
