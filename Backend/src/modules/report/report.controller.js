const reportService = require('./report.service');

const getDaily = async (req, res, next) => {
  try {
    const { date } = req.query;
    const report = await reportService.getDailyReport(req.user, date);
    res.status(200).json({ success: true, message: 'Daily report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const report = await reportService.getMonthlyReport(req.user, year, month);
    res.status(200).json({ success: true, message: 'Monthly report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
};

const getYearly = async (req, res, next) => {
  try {
    const { year } = req.query;
    const report = await reportService.getYearlyReport(req.user, year);
    res.status(200).json({ success: true, message: 'Yearly report retrieved successfully', data: report });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDaily,
  getMonthly,
  getYearly
};
