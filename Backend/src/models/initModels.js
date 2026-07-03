const { sequelize } = require('../config/db');
const User = require('../modules/auth/user.model');
const Employee = require('../modules/employee/employee.model');
const Department = require('../modules/department/department.model');
const Attendance = require('../modules/attendance/attendance.model');

const initModels = async () => {
  // Define associations
  Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
  Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
  Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

  Department.hasMany(Attendance, { foreignKey: 'departmentId', as: 'attendances' });
  Attendance.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

  await sequelize.sync();
};

module.exports = initModels;
