const { Op, fn, col } = require('sequelize');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');
const Attendance = require('../attendance/attendance.model');

const getWhereClauses = async (user, dateWhereClause = {}) => {
  let employeeWhere = { status: 'ACTIVE' };
  let attendanceWhere = { ...dateWhereClause };
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    if (managerDept) {
      employeeWhere.departmentId = managerDept.id;
      attendanceWhere.departmentId = managerDept.id;
    } else {
      employeeWhere.departmentId = null;
      attendanceWhere.departmentId = null;
    }
  } else if (user.role === 'EMPLOYEE') {
    employeeWhere.id = user.id;
    attendanceWhere.employeeId = user.id;
  }

  return { employeeWhere, attendanceWhere };
};

const calculateStats = async (user, dateWhereClause = {}) => {
  const { employeeWhere, attendanceWhere } = await getWhereClauses(user, dateWhereClause);

  const totalEmployees = await Employee.count({ where: employeeWhere });
  
  let totalDepartments = 0;
  if (user.role === 'ADMIN' || user.role === 'HR_MANAGER') {
    totalDepartments = await Department.count({ where: { status: 'ACTIVE' }});
  } else if (user.role === 'DEPARTMENT_MANAGER') {
    totalDepartments = 1;
  }

  const attendanceCounts = await Attendance.findAll({
    where: attendanceWhere,
    attributes: [
      'status',
      [fn('COUNT', col('id')), 'count']
    ],
    group: ['status']
  });

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalOnDuty = 0;
  let totalLeave = 0;

  attendanceCounts.forEach(record => {
    const status = record.status;
    const count = parseInt(record.getDataValue('count'), 10);
    if (status === 'PRESENT') totalPresent = count;
    if (status === 'ABSENT') totalAbsent = count;
    if (status === 'ON_DUTY') totalOnDuty = count;
    if (status === 'LEAVE') totalLeave = count;
  });
  
  let attendancePercentage = 0;
  if (totalEmployees > 0) {
    attendancePercentage = ((totalPresent / totalEmployees) * 100).toFixed(2);
  }

  return {
    totalEmployees,
    totalDepartments,
    totalPresent,
    totalAbsent,
    totalOnDuty,
    totalLeave,
    attendancePercentage: parseFloat(attendancePercentage)
  };
};

const getSummary = async (user) => {
  return await calculateStats(user);
};

const getToday = async (user) => {
  const today = new Date().toISOString().split('T')[0];
  return await calculateStats(user, { attendanceDate: today });
};

const getMonthly = async (user) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); 
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); 
  
  const dateWhereClause = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  return await calculateStats(user, dateWhereClause);
};

const getYearly = async (user) => {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const dateWhereClause = {
    attendanceDate: {
      [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
    }
  };
  
  return await calculateStats(user, dateWhereClause);
};

module.exports = {
  getSummary,
  getToday,
  getMonthly,
  getYearly
};
