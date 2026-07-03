const aiService = require('./ai.service');

const generateSummary = async (req, res, next) => {
  try {
    const summary = await aiService.generateSummary(req.user);
    res.status(200).json({ success: true, message: 'AI Summary generated successfully', data: { summary } });
  } catch (error) {
    next(error);
  }
};

const generateEmployeeSummary = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Employee name is required' });
    
    const summary = await aiService.generateEmployeeSummary(req.user, name);
    res.status(200).json({ success: true, message: 'AI Employee Summary generated successfully', data: { summary } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateSummary,
  generateEmployeeSummary
};
