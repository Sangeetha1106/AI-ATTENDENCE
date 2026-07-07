const employeeService = require('./employee.service');

const addEmployee = async (req, res, next) => {
  try {
    const result = await employeeService.addEmployee(req.body);
    const { employee, emailSent } = result;
    
    let message = 'Employee created successfully.';
    if (!emailSent) {
      message = 'Employee created successfully, but email delivery failed.';
    }

    res.status(201).json({ success: true, message, data: employee });
  } catch (error) {
    next(error);
  }
};

const getAllEmployees = async (req, res, next) => {
  try {
    const { page, limit, search, department, status, designation } = req.query;
    const result = await employeeService.getAllEmployees({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      departmentId: department,
      status,
      designation
    });
    // For backward compatibility with tests/existing frontend, you might still return data: result, 
    // but the result object now contains { employees, totalEmployees, currentPage, totalPages }.
    // Let's spread it in the response so data is the list, or keep it inside data.
    // The requirement is: Response: { "employees": [...], "totalEmployees": 128, "currentPage": 1, "totalPages": 13 }
    res.status(200).json({ 
      success: true, 
      message: 'Employees retrieved successfully', 
      data: result.employees,
      employees: result.employees,
      totalEmployees: result.totalEmployees,
      currentPage: result.currentPage,
      totalPages: result.totalPages
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id, req.user);
    res.status(200).json({ success: true, message: 'Employee retrieved successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

const updateEmployeeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
      const error = new Error('Invalid status. Must be ACTIVE or INACTIVE');
      error.statusCode = 400;
      throw error;
    }
    
    const employee = await employeeService.updateEmployeeStatus(req.params.id, status);
    res.status(200).json({ success: true, message: 'Employee status updated successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

const searchEmployeeByName = async (req, res, next) => {
  try {
    const { name } = req.query;
    const employee = await employeeService.searchEmployeeByName(name);
    res.status(200).json({ success: true, message: 'Employee found', data: employee });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    let email = req.user.email;
    
    // Fallback for older tokens that don't have email in the payload
    if (!email) {
      const User = require('../auth/user.model');
      const userRecord = await User.findByPk(req.user.id);
      if (!userRecord) {
        throw new Error('User record not found');
      }
      email = userRecord.email;
    }

    const employee = await employeeService.getEmployeeByEmail(email);
    res.status(200).json({ success: true, message: 'My profile retrieved', data: employee });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeStatus,
  searchEmployeeByName,
  getMe
};
