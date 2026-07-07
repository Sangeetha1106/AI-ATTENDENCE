const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PRESENT', 'ABSENT', 'ON_DUTY', 'LEAVE', 'LATE'),
    allowNull: false
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  distanceFromOffice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  locationStatus: {
    type: DataTypes.ENUM('INSIDE', 'OUTSIDE'),
    allowNull: true
  },
  workingHours: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  gpsAccuracy: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true
  },
  browser: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = Attendance;
