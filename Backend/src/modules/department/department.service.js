const Department = require('./department.model');

const createDepartment = async (data) => {
  const existingName = await Department.findOne({ where: { departmentName: data.departmentName } });
  if (existingName) {
    const error = new Error('Department name already exists');
    error.statusCode = 400;
    throw error;
  }
  
  const existingCode = await Department.findOne({ where: { departmentCode: data.departmentCode } });
  if (existingCode) {
    const error = new Error('Department code already exists');
    error.statusCode = 400;
    throw error;
  }
  
  return await Department.create(data);
};

const getAllDepartments = async () => {
  return await Department.findAll();
};

const getDepartmentById = async (id) => {
  const department = await Department.findByPk(id);
  if (!department) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }
  return department;
};

const updateDepartment = async (id, data) => {
  const department = await Department.findByPk(id);
  if (!department) {
    const error = new Error('Department not found');
    error.statusCode = 404;
    throw error;
  }
  
  if (data.departmentName && data.departmentName !== department.departmentName) {
    const existingName = await Department.findOne({ where: { departmentName: data.departmentName } });
    if (existingName) {
      const error = new Error('Department name already exists');
      error.statusCode = 400;
      throw error;
    }
  }
  
  if (data.departmentCode && data.departmentCode !== department.departmentCode) {
    const existingCode = await Department.findOne({ where: { departmentCode: data.departmentCode } });
    if (existingCode) {
      const error = new Error('Department code already exists');
      error.statusCode = 400;
      throw error;
    }
  }
  
  await department.update(data);
  return department;
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment
};
