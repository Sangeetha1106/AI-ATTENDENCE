const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Department = require('../department/department.model');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Department,
      key: 'id'
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'EMPLOYEE'
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  }
});



// Hook to auto-generate employeeId before creation
Employee.beforeValidate(async (employee, options) => {
  if (!employee.employeeId) {
    const lastEmployee = await Employee.findOne({
      order: [['id', 'DESC']]
    });
    
    let nextNum = 1;
    if (lastEmployee && lastEmployee.employeeId && lastEmployee.employeeId.startsWith('EMP')) {
      const numPart = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
      if (!isNaN(numPart)) {
        nextNum = numPart + 1;
      }
    }
    
    employee.employeeId = `EMP${nextNum.toString().padStart(3, '0')}`;
  }
});

module.exports = Employee;
