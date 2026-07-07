const Employee = require('./employee.model');
const Department = require('../department/department.model');
const User = require('../auth/user.model');
const bcryptUtil = require('../../utils/bcrypt');
const emailService = require('../../services/email.service');
const { sequelize } = require('../../config/db');
const crypto = require('crypto');

const addEmployee = async (data) => {
  const email = data.email ? data.email.trim() : '';
  console.log(`[EMPLOYEE] Attempting to create employee with email: "${email}"`);

  // Check if email already exists in User or Employee tables
  const existingEmployee = await Employee.findOne({ where: { email } });
  const existingUser = await User.findOne({ where: { email } });
  
  if (existingEmployee || existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }
  
  if (data.employeeId) {
    const existingEmployeeId = await Employee.findOne({ where: { employeeId: data.employeeId } });
    if (existingEmployeeId) {
      const error = new Error('Employee ID is already taken');
      error.statusCode = 400;
      throw error;
    }
  }
  
  const tempPassword = 'Password123';
  const hashedPassword = await bcryptUtil.hashPassword(tempPassword);

  const t = await sequelize.transaction();

  try {
    // 1. Create Employee
    const employeeData = { 
      ...data, 
      email: email, 
      password: hashedPassword,
      role: 'EMPLOYEE'
    };
    
    if (!employeeData.departmentId) employeeData.departmentId = null;
    if (!employeeData.phone) employeeData.phone = null;
    if (!employeeData.joiningDate) employeeData.joiningDate = null;
    
    const employee = await Employee.create(employeeData, { transaction: t });

    await t.commit();

    // 3. Send Email Notification
    let emailSent = false;
    try {
      await emailService.sendWelcomeEmail(email, data.fullName, tempPassword);
      emailSent = true;
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // We do not rollback transaction if email fails, we just notify
    }

    return { employee, emailSent };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

const getAllEmployees = async (options = {}) => {
  const { page = 1, limit = 10, search, departmentId, status, designation } = options;
  const { Op } = require('sequelize');
  
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { employeeId: { [Op.iLike]: `%${search}%` } }
    ];
  }
  
  if (departmentId) {
    where.departmentId = departmentId;
  }
  
  if (status) {
    where.status = status;
  }
  
  if (designation) {
    where.designation = { [Op.iLike]: `%${designation}%` };
  }
  
  const offset = (page - 1) * limit;
  
  const { rows, count } = await Employee.findAndCountAll({
    where,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }],
    order: [['createdAt', 'DESC']]
  });
  
  return {
    employees: rows,
    totalEmployees: count,
    currentPage: parseInt(page, 10),
    totalPages: Math.ceil(count / limit)
  };
};

const getEmployeeById = async (id, user) => {
  const employee = await Employee.findByPk(id, {
    include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }]
  });
  
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  
  // Logic for EMPLOYEE viewing only their own profile
  // Assuming the user.id corresponds to the employee.id for simplicity
  if (user.role === 'EMPLOYEE' && employee.id !== user.id) {
    const error = new Error('Forbidden. You can only view your own profile');
    error.statusCode = 403;
    throw error;
  }
  
  return employee;
};

const updateEmployeeStatus = async (id, status) => {
  const employee = await Employee.findByPk(id);
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  
  employee.status = status;
  await employee.save();
  return employee;
};

const searchEmployeeByName = async (name) => {
  if (!name) {
    const error = new Error('Name parameter is required');
    error.statusCode = 400;
    throw error;
  }
  const { Op } = require('sequelize');
  const employee = await Employee.findOne({
    where: {
      fullName: {
        [Op.iLike]: `%${name}%`
      }
    },
    include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }]
  });
  
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  return employee;
};

const getEmployeeByEmail = async (email) => {
  const employee = await Employee.findOne({
    where: { email },
    include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }]
  });
  
  if (!employee) {
    const error = new Error('Employee not found');
    error.statusCode = 404;
    throw error;
  }
  
  return employee;
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeStatus,
  searchEmployeeByName,
  getEmployeeByEmail
};
