const User = require('./user.model');
const jwtUtil = require('../../utils/jwt');
const bcryptUtil = require('../../utils/bcrypt');

const register = async (userData) => {
  const { fullName, email, password, role, department } = userData;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcryptUtil.hashPassword(password);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
    department
  });

  const userResponse = newUser.toJSON();
  delete userResponse.password;

  return userResponse;
};

const login = async (credentials) => {
  const { email, password } = credentials;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcryptUtil.comparePassword(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const payload = {
    id: user.id,
    name: user.fullName,
    role: user.role,
    department: user.department
  };

  const token = jwtUtil.generateToken(payload);

  const userResponse = user.toJSON();
  delete userResponse.password;

  return { token, user: userResponse };
};

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

module.exports = {
  register,
  login,
  getProfile
};
