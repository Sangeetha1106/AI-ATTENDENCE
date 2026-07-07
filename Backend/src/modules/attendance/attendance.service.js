const { Op } = require('sequelize');
const Attendance = require('./attendance.model');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');

const getUserEmail = async (user) => {
  let email = user.email;
  if (!email) {
    const User = require('../auth/user.model');
    const userRecord = await User.findByPk(user.id);
    if (userRecord) email = userRecord.email;
  }
  return email;
};

const getEmployeeIdForUser = async (user) => {
  const email = await getUserEmail(user);
  const employee = await Employee.findOne({ where: { email } });
  return employee ? employee.id : null;
};

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
    const loggedInEmployeeId = await getEmployeeIdForUser(user);
    if (String(loggedInEmployeeId) !== String(employeeId)) {
      const err = new Error('Forbidden. You can only view your own attendance');
      err.statusCode = 403;
      throw err;
    }
    return true;
  }
  
  return false;
};

const markAttendance = async (data, user) => {
  throw new Error('Manual attendance marking by Admin/HR is disabled. Employees must use the GPS Check-In workflow.');
};

const getAllAttendance = async (user, query = {}) => {
  const { page = 1, limit = 10, search, date, department, status, sortField, sortOrder = 'DESC' } = query;
  
  let whereClause = {};
  let employeeWhereClause = {};
  
  if (user.role === 'DEPARTMENT_MANAGER') {
    const managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    whereClause.departmentId = managerDept ? managerDept.id : null;
  } else if (user.role === 'EMPLOYEE') {
    whereClause.employeeId = await getEmployeeIdForUser(user);
  }

  if (date) {
    whereClause.attendanceDate = date;
  }
  
  if (department) {
    employeeWhereClause.departmentId = department;
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  if (search) {
    employeeWhereClause = {
      ...employeeWhereClause,
      [Op.or]: [
        { fullName: { [Op.like]: `%${search}%` } },
        { employeeId: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    };
  }
  
  let order = [['attendanceDate', 'DESC']];
  if (sortField) {
    if (sortField === 'EmployeeName') {
      order = [[{ model: Employee, as: 'employee' }, 'fullName', sortOrder]];
    } else if (sortField === 'Department') {
      order = [[{ model: Department, as: 'department' }, 'departmentName', sortOrder]];
    } else if (sortField === 'Status' || sortField === 'Date') {
      order = [[sortField === 'Date' ? 'attendanceDate' : 'status', sortOrder]];
    }
  }

  const offset = (page - 1) * limit;

  return await Attendance.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    order: order,
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId', 'email'], where: Object.keys(employeeWhereClause).length ? employeeWhereClause : undefined },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const getAttendanceByEmployee = async (employeeId, user) => {
  if (user.role === 'EMPLOYEE') {
    employeeId = await getEmployeeIdForUser(user);
  }
  await checkPermissions(user, employeeId);
  
  return await Attendance.findAll({
    where: { employeeId },
    order: [['attendanceDate', 'DESC']],
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
    whereClause.employeeId = await getEmployeeIdForUser(user);
  }

  return await Attendance.findAll({
    where: whereClause,
    order: [['attendanceDate', 'DESC']],
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
    whereClause.employeeId = await getEmployeeIdForUser(user);
  }

  return await Attendance.findAll({
    where: whereClause,
    order: [['attendanceDate', 'DESC']],
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
    whereClause.employeeId = await getEmployeeIdForUser(user);
  }

  return await Attendance.findAll({
    where: whereClause,
    order: [['attendanceDate', 'DESC']],
    include: [
      { model: Employee, as: 'employee', attributes: ['id', 'fullName', 'employeeId'] },
      { model: Department, as: 'department', attributes: ['id', 'departmentName'] }
    ]
  });
};

const OFFICE_LAT = 11.002373868782655;
const OFFICE_LON = 77.04344857733449;
const MAX_RADIUS_METERS = 100; // 100 meters

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};



const checkIn = async (user, locationData) => {
  const { latitude, longitude, deviceTime, gpsAccuracy, device, browser, ipAddress } = locationData || {};
  
  const email = await getUserEmail(user);
  const employee = await Employee.findOne({ where: { email } });
  if (!employee) {
    const err = new Error('Employee profile not found');
    err.statusCode = 404;
    throw err;
  }

  if (!latitude || !longitude) {
    const err = new Error('GPS coordinates are required to mark attendance');
    err.statusCode = 400;
    throw err;
  }
  
  const distance = calculateDistance(OFFICE_LAT, OFFICE_LON, parseFloat(latitude), parseFloat(longitude));
  
  if (distance > MAX_RADIUS_METERS) {
    const err = new Error('Attendance rejected. Outside office premises.');
    err.statusCode = 403;
    throw err;
  }

  const today = new Date().toISOString().split('T')[0];
  
  const existingAttendance = await Attendance.findOne({
    where: {
      employeeId: employee.id,
      attendanceDate: today
    }
  });

  if (existingAttendance) {
    const err = new Error('You have already checked in today');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  let status = 'PRESENT';
  // 09:00 AM -> Present
  // 09:01 AM - 09:15 AM -> Grace Time (PRESENT)
  // 09:16 AM onwards -> LATE
  if (currentHour > 9 || (currentHour === 9 && currentMinute > 15)) {
    status = 'LATE';
  }

  return await Attendance.create({
    employeeId: employee.id,
    departmentId: employee.departmentId,
    attendanceDate: today,
    status: status,
    checkInTime: now,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    distanceFromOffice: distance,
    locationStatus: 'INSIDE',
    deviceTime: deviceTime ? new Date(deviceTime) : null,
    createdBy: user.id,
    gpsAccuracy: gpsAccuracy ? parseFloat(gpsAccuracy) : null,
    device,
    browser,
    ipAddress
  });
};

const checkOut = async (user, locationData) => {
  const { latitude, longitude, gpsAccuracy, device, browser, ipAddress } = locationData || {};

  const email = await getUserEmail(user);
  const employee = await Employee.findOne({ where: { email } });
  if (!employee) {
    const err = new Error('Employee profile not found');
    err.statusCode = 404;
    throw err;
  }

  if (!latitude || !longitude) {
    const err = new Error('GPS coordinates are required to mark attendance');
    err.statusCode = 400;
    throw err;
  }
  
  const distance = calculateDistance(OFFICE_LAT, OFFICE_LON, parseFloat(latitude), parseFloat(longitude));
  const today = new Date().toISOString().split('T')[0];

  const existingAttendance = await Attendance.findOne({
    where: {
      employeeId: employee.id,
      attendanceDate: today
    }
  });

  if (!existingAttendance) {
    const err = new Error('You have not checked in today');
    err.statusCode = 400;
    throw err;
  }

  if (existingAttendance.checkOutTime) {
    const err = new Error('You have already checked out today');
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  existingAttendance.checkOutTime = now;
  
  const checkInTime = new Date(existingAttendance.checkInTime);
  const diffMs = now - checkInTime;
  const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(2);
  
  existingAttendance.workingHours = `${diffHrs} hours`;
  
  if (gpsAccuracy) existingAttendance.gpsAccuracy = parseFloat(gpsAccuracy);
  if (device) existingAttendance.device = device;
  if (browser) existingAttendance.browser = browser;
  if (ipAddress) existingAttendance.ipAddress = ipAddress;
  
  await existingAttendance.save();
  
  return existingAttendance;
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByMonth,
  getAttendanceByYear,
  checkIn,
  checkOut
};
