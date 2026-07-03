const dashboardService = require('./dashboard.service');

const getSummary = async (req, res, next) => {
  try {
    const stats = await dashboardService.getSummary(req.user);
    res.status(200).json({ success: true, message: 'Dashboard summary retrieved', data: stats });
  } catch (error) {
    next(error);
  }
};

const getToday = async (req, res, next) => {
  try {
    const stats = await dashboardService.getToday(req.user);
    res.status(200).json({ success: true, message: 'Today dashboard retrieved', data: stats });
  } catch (error) {
    next(error);
  }
};

const getMonthly = async (req, res, next) => {
  try {
    const stats = await dashboardService.getMonthly(req.user);
    res.status(200).json({ success: true, message: 'Monthly dashboard retrieved', data: stats });
  } catch (error) {
    next(error);
  }
};

const getYearly = async (req, res, next) => {
  try {
    const stats = await dashboardService.getYearly(req.user);
    res.status(200).json({ success: true, message: 'Yearly dashboard retrieved', data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getToday,
  getMonthly,
  getYearly
};
