const OnDutyRequest = require('./onDutyRequest.model');
const Employee = require('../employee/employee.model');
const Department = require('../department/department.model');
const Notification = require('../notification/notification.model');

const getUserEmail = async (user) => {
  let email = user.email;
  if (!email) {
    const User = require('../auth/user.model');
    const userRecord = await User.findByPk(user.id);
    if (userRecord) email = userRecord.email;
  }
  return email;
};

const getEmployeeIdForUser = async (user) => {
  const email = await getUserEmail(user);
  if (!email) return null;
  const employee = await Employee.findOne({ where: { email } });
  return employee ? employee.id : null;
};

const applyOnDuty = async (user, data) => {
  const { date, purpose, location, details } = data;
  const employeeId = await getEmployeeIdForUser(user);

  if (!employeeId) throw new Error('Employee profile not found.');

  const request = await OnDutyRequest.create({
    employeeId,
    date,
    purpose,
    location,
    details,
    status: 'PENDING'
  });

  return request;
};

const getMyOnDuty = async (user) => {
  const employeeId = await getEmployeeIdForUser(user);
  return await OnDutyRequest.findAll({
    where: { employeeId },
    order: [['createdAt', 'DESC']]
  });
};

const getAllOnDuty = async (user) => {
  let whereClause = {};

  if (user.role === 'DEPARTMENT_MANAGER') {
    let managerDept = null;
    if (!isNaN(user.department)) {
      managerDept = await Department.findByPk(user.department);
    } else {
      managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    }
    if (managerDept) {
       const employees = await Employee.findAll({ where: { departmentId: managerDept.id }});
       const empIds = employees.map(e => e.id);
       whereClause.employeeId = empIds;
    } else {
       return [];
    }
  }

  return await OnDutyRequest.findAll({
    where: whereClause,
    include: [{ model: Employee, as: 'employee' }],
    order: [['createdAt', 'DESC']]
  });
};

const updateStatus = async (user, id, status) => {
  const request = await OnDutyRequest.findByPk(id, {
    include: [{ model: Employee, as: 'employee' }]
  });
  
  if (!request) throw new Error('On Duty request not found');

  if (status === 'MANAGER_APPROVED') {
    request.managerId = user.id;
  } else if (status === 'APPROVED' || status === 'REJECTED') {
    request.hrId = user.id;
  }
  
  request.status = status;
  await request.save();

  // Create Notification
  let msg = `Your On Duty request for ${request.date} has been ${status.replace('_', ' ').toLowerCase()}.`;
  
  const User = require('../auth/user.model');
  const empUser = await User.findOne({ where: { email: request.employee.email } });
  if (empUser) {
    await Notification.create({
      userId: empUser.id,
      title: 'On Duty Update',
      message: msg,
      type: status === 'REJECTED' ? 'ERROR' : 'SUCCESS'
    });
  }

  return request;
};

module.exports = {
  applyOnDuty,
  getMyOnDuty,
  getAllOnDuty,
  updateStatus
};
