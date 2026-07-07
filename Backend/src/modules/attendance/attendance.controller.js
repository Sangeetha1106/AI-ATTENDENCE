const attendanceService = require('./attendance.service');

const markAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.markAttendance(req.body, req.user);
    res.status(201).json({ success: true, message: 'Attendance marked successfully', data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAllAttendance(req.user, req.query);
    res.status(200).json({ success: true, message: 'Attendance retrieved successfully', data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByEmployee = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAttendanceByEmployee(req.params.employeeId, req.user);
    res.status(200).json({ success: true, message: 'Employee attendance retrieved', data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByDate = async (req, res, next) => {
  try {
    const attendance = await attendanceService.getAttendanceByDate(req.params.date, req.user);
    res.status(200).json({ success: true, message: 'Attendance for date retrieved', data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByMonth = async (req, res, next) => {
  try {
    const { year, month } = req.params;
    const attendance = await attendanceService.getAttendanceByMonth(year, month, req.user);
    res.status(200).json({ success: true, message: 'Attendance for month retrieved', data: attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByYear = async (req, res, next) => {
  try {
    const { year } = req.params;
    const attendance = await attendanceService.getAttendanceByYear(year, req.user);
    res.status(200).json({ success: true, message: 'Attendance for year retrieved', data: attendance });
  } catch (error) {
    next(error);
  }
};

const checkIn = async (req, res, next) => {
  try {
    req.body.ipAddress = req.ip || req.connection.remoteAddress;
    req.body.browser = req.headers['user-agent'];
    
    const attendance = await attendanceService.checkIn(req.user, req.body);
    res.status(200).json({ success: true, message: 'Checked in successfully', data: attendance });
  } catch (error) {
    next(error);
  }
};

const checkOut = async (req, res, next) => {
  try {
    req.body.ipAddress = req.ip || req.connection.remoteAddress;
    req.body.browser = req.headers['user-agent'];
    
    const attendance = await attendanceService.checkOut(req.user, req.body);
    res.status(200).json({ success: true, message: 'Checked out successfully', data: attendance });
  } catch (error) {
    next(error);
  }
};

const logError = async (req, res, next) => {
  try {
    console.error('FRONTEND GEOLOCATION ERROR:', JSON.stringify(req.body, null, 2));
    res.status(200).json({ success: true, message: 'Error logged' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByMonth,
  getAttendanceByYear,
  checkIn,
  checkOut,
  logError
};
