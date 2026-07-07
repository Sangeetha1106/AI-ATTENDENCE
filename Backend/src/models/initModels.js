const { sequelize } = require('../config/db');
const User = require('../modules/auth/user.model');
const Employee = require('../modules/employee/employee.model');
const Department = require('../modules/department/department.model');
const Attendance = require('../modules/attendance/attendance.model');
const LeaveRequest = require('../modules/leave/leave.model');
const OnDutyRequest = require('../modules/onduty/onDutyRequest.model');
const Notification = require('../modules/notification/notification.model');

const initModels = async () => {
  // Department & Employee
  Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
  Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  // Employee & Attendance
  Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
  Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

  // Department & Attendance
  Department.hasMany(Attendance, { foreignKey: 'departmentId', as: 'attendances' });
  Attendance.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  // Employee & LeaveRequest
  Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
  LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

  // Employee & OnDutyRequest
  Employee.hasMany(OnDutyRequest, { foreignKey: 'employeeId', as: 'onDutyRequests' });
  OnDutyRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

  // User & Notification
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  await sequelize.sync();
};

module.exports = initModels;
