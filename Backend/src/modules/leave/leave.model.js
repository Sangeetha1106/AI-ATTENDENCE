const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Employee = require('../employee/employee.model');

const LeaveRequest = sequelize.define('LeaveRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Employee,
      key: 'id'
    }
  },
  leaveType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'MANAGER_APPROVED', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hrId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = LeaveRequest;
