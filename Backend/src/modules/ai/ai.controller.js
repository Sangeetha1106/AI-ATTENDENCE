const aiService = require('./ai.service');

const getOrganizationSummary = async (req, res, next) => {
  try {
    const data = await aiService.getOrganizationSummary(req.user);
    res.status(200).json({ success: true, message: 'Organization summary generated', data });
  } catch (error) {
    next(error);
  }
};

const searchEmployeeSummary = async (req, res, next) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: 'Employee name is required' });
    
    const data = await aiService.searchEmployeeSummary(req.user, name);
    res.status(200).json({ success: true, message: 'Employee summary generated', data });
  } catch (error) {
    next(error);
  }
};

const getEmployeeSummaryById = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const data = await aiService.getEmployeeSummaryById(req.user, employeeId);
    res.status(200).json({ success: true, message: 'Employee summary generated', data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizationSummary,
  searchEmployeeSummary,
  getEmployeeSummaryById
};
