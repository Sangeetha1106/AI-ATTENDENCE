const { Op } = require('sequelize');
const Attendance = require('../attendance/attendance.model');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');

const getDailyReport = async (user, date) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  let attendanceWhere = { attendanceDate: targetDate };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    attendanceWhere.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    attendanceWhere.employeeId = user.id;
  }
  
  const records = await Attendance.findAll({
    where: attendanceWhere,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ],
    order: [['createdAt', 'DESC']]
  });

  return {
    reportType: 'DAILY',
    date: targetDate,
    totalRecords: records.length,
    records
  };
};

const getMonthlyReport = async (user, year, month) => {
  const targetYear = year || new Date().getFullYear();
  const targetMonth = month || (new Date().getMonth() + 1);
  
  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0); 
  
  let attendanceWhere = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    attendanceWhere.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    attendanceWhere.employeeId = user.id;
  }

  const records = await Attendance.findAll({
    where: attendanceWhere,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ],
    order: [['attendanceDate', 'DESC']]
  });

  return {
    reportType: 'MONTHLY',
    year: targetYear,
    month: targetMonth,
    totalRecords: records.length,
    records
  };
};

const getYearlyReport = async (user, year) => {
  const targetYear = year || new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear, 11, 31);
  
  let attendanceWhere = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    attendanceWhere.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    attendanceWhere.employeeId = user.id;
  }

  const records = await Attendance.findAll({
    where: attendanceWhere,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ],
    order: [['attendanceDate', 'DESC']]
  });

  return {
    reportType: 'YEARLY',
    year: targetYear,
    totalRecords: records.length,
    records
  };
};

module.exports = {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport
};
