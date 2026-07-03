const { Op } = require('sequelize');
const Attendance = require('./attendance.model');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');

const checkPermissions = async (user, employeeId) => {
  if (user.role === 'ADMIN' || user.role === 'HR_MANAGER') {
    return true;
  }
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: Department, as: 'department' }]
    });
    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    }
    if (user.department && employee.department && user.department !== employee.department.departmentName) {
      const err = new Error('Forbidden. You can only manage attendance for your own department');
      err.statusCode = 403;
      throw err;
    }
    return true;
  }
  
  if (user.role === 'EMPLOYEE') {
    if (user.id !== parseInt(employeeId)) {
      const err = new Error('Forbidden. You can only access your own attendance');
      err.statusCode = 403;
      throw err;
    }
    return true;
  }
  
  return false;
};

const markAttendance = async (data, user) => {
  const { employeeId, departmentId, attendanceDate, status, remarks } = data;

  await checkPermissions(user, employeeId);

  const existingAttendance = await Attendance.findOne({
    where: {
      employeeId,
      attendanceDate
    }
  });

  if (existingAttendance) {
    const error = new Error('Attendance record already exists for this employee on the specified date.');
    error.statusCode = 400;
    throw error;
  }

  return await Attendance.create({
    employeeId,
    departmentId,
    attendanceDate,
    status,
    remarks,
    createdBy: user.id
  });
};

const getAllAttendance = async (user) => {
  let whereClause = {};
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    whereClause.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    whereClause.employeeId = user.id;
  }

  return await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const getAttendanceByEmployee = async (employeeId, user) => {
  await checkPermissions(user, employeeId);
  
  return await Attendance.findAll({
    where: { employeeId },
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const getAttendanceByDate = async (date, user) => {
  let whereClause = { attendanceDate: date };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    whereClause.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    whereClause.employeeId = user.id;
  }

  return await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const getAttendanceByMonth = async (year, month, user) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); 
  
  let whereClause = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    whereClause.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    whereClause.employeeId = user.id;
  }

  return await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const getAttendanceByYear = async (year, user) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  let whereClause = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    whereClause.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    whereClause.employeeId = user.id;
  }

  return await Attendance.findAll({
    where: whereClause,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByMonth,
  getAttendanceByYear
};
