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
    const attendance = await attendanceService.getAllAttendance(req.user);
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

module.exports = {
  markAttendance,
  getAllAttendance,
  getAttendanceByEmployee,
  getAttendanceByDate,
  getAttendanceByMonth,
  getAttendanceByYear
};
