const success = (res, data, message = 'Success') => {
  return res.status(200).json({ success: true, message, data });
};

const error = (res, message = 'Error', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, message });
};

module.exports = {
  success,
  error
};
