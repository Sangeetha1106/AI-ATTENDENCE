const employeeService = require('./employee.service');

const addEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.addEmployee(req.body);
    res.status(201).json({ success: true, message: 'Employee added successfully', data: employee });
  } catch (error) {
    next(error);
  }
};

const getAllEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.status(200).json({ success: true, message: 'Employees retrieved successfully', data: employees });
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

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeStatus
};
