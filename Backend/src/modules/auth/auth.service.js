const User = require('./user.model');
const Employee = require('../employee/employee.model');
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
  const email = credentials.email ? credentials.email.trim() : '';
  const password = credentials.password;

  console.log(`[AUTH] Login attempt for email: "${email}"`);

  let account = await User.findOne({ where: { email } });
  
  if (!account) {
    account = await Employee.findOne({ where: { email } });
    if (!account) {
      console.log(`[AUTH] Failed: Employee/User with email "${email}" NOT FOUND in PostgreSQL.`);
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
    console.log(`[AUTH] Success: Employee found in DB. ID: ${account.id}, Role: ${account.role}, Name: ${account.fullName}`);
  } else {
    console.log(`[AUTH] Success: User found in DB. ID: ${account.id}, Role: ${account.role}, Name: ${account.fullName}`);
  }

  const isPasswordValid = await bcryptUtil.comparePassword(password, account.password);
  console.log(`[AUTH] Password comparison result for "${email}": ${isPasswordValid ? 'MATCH' : 'MISMATCH'}`);
  
  if (!isPasswordValid) {
    console.log(`[AUTH] Failed: Incorrect password for "${email}".`);
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (account.forcePasswordChange) {
    console.log(`[AUTH] Success: Login OK but forcePasswordChange is TRUE for "${email}". Redirecting to change password.`);
    return { 
      requirePasswordChange: true, 
      user: { email: account.email, name: account.fullName } 
    };
  }

  const payload = {
    id: account.id,
    name: account.fullName,
    email: account.email,
    role: account.role,
    department: account.department || account.departmentId
  };

  const token = jwtUtil.generateToken(payload);
  console.log(`[AUTH] Success: JWT Token generated for "${email}".`);

  const userResponse = account.toJSON();
  delete userResponse.password;

  console.log(`[AUTH] Final Login Success for "${email}". Returning data.`);
  return { token, user: userResponse };
};

const getProfile = async (userId) => {
  let user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    user = await Employee.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
  }

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const changePassword = async (email, tempPassword, newPassword) => {
  let account = await User.findOne({ where: { email } });
  if (!account) {
    account = await Employee.findOne({ where: { email } });
  }

  if (!account) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Employee might not have forcePasswordChange property, just bypass check if it's undefined
  if (account.forcePasswordChange !== undefined && !account.forcePasswordChange) {
    // We allow changing password anytime from Profile, so don't strictly require forcePasswordChange to be true 
    // unless this is a mandatory flow. Since we bypass it for employees, it's fine.
  }

  const isPasswordValid = await bcryptUtil.comparePassword(tempPassword, account.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid temporary password');
    error.statusCode = 401;
    throw error;
  }

  const hashedNewPassword = await bcryptUtil.hashPassword(newPassword);
  account.password = hashedNewPassword;
  if (account.forcePasswordChange !== undefined) {
    account.forcePasswordChange = false;
  }
  await account.save();

  const payload = {
    id: account.id,
    name: account.fullName,
    email: account.email,
    role: account.role,
    department: account.department || account.departmentId
  };

  const token = jwtUtil.generateToken(payload);
  const userResponse = account.toJSON();
  delete userResponse.password;

  return { token, user: userResponse };
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};
