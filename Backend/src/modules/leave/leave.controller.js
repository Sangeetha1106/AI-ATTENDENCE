const leaveService = require('./leave.service');

const applyLeave = async (req, res, next) => {
  try {
    const { leaveType } = req.body;
    if (!leaveType || typeof leaveType !== 'string' || leaveType.trim().length < 3 || leaveType.trim().length > 50) {
      const err = new Error('Leave Type is required and must be between 3 and 50 characters.');
      err.statusCode = 400;
      throw err;
    }

    const leave = await leaveService.applyLeave(req.user, req.body);
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getMyLeaves(req.user);
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getAllLeaves(req.user);
    res.status(200).json({ success: true, data: leaves });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const leave = await leaveService.updateStatus(req.user, id, status);
    res.status(200).json({ success: true, data: leave });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateStatus
};
