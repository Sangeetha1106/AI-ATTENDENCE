const Employee = require('./employee.model');
const Department = require('../department/department.model');

const addEmployee = async (data) => {
  const existingEmployee = await Employee.findOne({ where: { email: data.email } });
  if (existingEmployee) {
    const error = new Error('Email is already registered for another employee');
    error.statusCode = 400;
    throw error;
  }
  
  return await Employee.create(data);
};

const getAllEmployees = async () => {
  return await Employee.findAll({
    include: [{ model: Department, as: 'department', attributes: ['id', 'departmentName'] }]
  });
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

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeStatus
};
