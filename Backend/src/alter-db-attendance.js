require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./modules/auth/user.model');
const Employee = require('./modules/employee/employee.model');
const Department = require('./modules/department/department.model');
const Attendance = require('./modules/attendance/attendance.model');

const syncDb = async () => {
  try {
    console.log("Syncing database with alter: true...");
    
    // Define associations
    Department.hasMany(Employee, { foreignKey: 'departmentId', as: 'employees' });
    Employee.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
  
    Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
    Attendance.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
  
    Department.hasMany(Attendance, { foreignKey: 'departmentId', as: 'attendances' });
    Attendance.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
    
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Database sync failed", error);
  } finally {
    process.exit(0);
  }
};

syncDb();
