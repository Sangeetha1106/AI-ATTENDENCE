const onDutyService = require('./onduty.service');

const applyOnDuty = async (req, res, next) => {
  try {
    const request = await onDutyService.applyOnDuty(req.user, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

const getMyOnDuty = async (req, res, next) => {
  try {
    const requests = await onDutyService.getMyOnDuty(req.user);
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const getAllOnDuty = async (req, res, next) => {
  try {
    const requests = await onDutyService.getAllOnDuty(req.user);
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await onDutyService.updateStatus(req.user, id, status);
    res.status(200).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyOnDuty,
  getMyOnDuty,
  getAllOnDuty,
  updateStatus
};
