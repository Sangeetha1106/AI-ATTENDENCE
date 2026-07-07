const authService = require('./auth.service');

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log(`[AUTH-CONTROLLER] Received login request for: ${req.body.email}`);
    const result = await authService.login(req.body);
    console.log(`[AUTH-CONTROLLER] Login successful for: ${req.body.email}`);
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    console.log(`[AUTH-CONTROLLER] Login error:`, error.message);
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, message: 'User profile retrieved', data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { email, tempPassword, newPassword } = req.body;
    const result = await authService.changePassword(email, tempPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully', data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};
