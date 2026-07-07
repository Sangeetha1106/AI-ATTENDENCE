const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Employee = require('../employee/employee.model');

const OnDutyRequest = sequelize.define('OnDutyRequest', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
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

module.exports = OnDutyRequest;
