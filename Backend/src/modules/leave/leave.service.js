const LeaveRequest = require('./leave.model');
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

const applyLeave = async (user, data) => {
  const { leaveType, startDate, endDate, reason } = data;
  const employeeId = await getEmployeeIdForUser(user);

  if (!employeeId) throw new Error('Employee profile not found.');

  const request = await LeaveRequest.create({
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'PENDING'
  });

  await Notification.create({
    userId: user.id,
    title: 'Leave Submitted Successfully',
    message: `Your ${leaveType} from ${startDate} to ${endDate} has been submitted and is pending manager approval.`,
    type: 'INFO'
  });

  return request;
};

const getMyLeaves = async (user) => {
  const employeeId = await getEmployeeIdForUser(user);
  return await LeaveRequest.findAll({
    where: { employeeId },
    order: [['createdAt', 'DESC']]
  });
};

const getAllLeaves = async (user) => {
  let whereClause = {};

  if (user.role === 'DEPARTMENT_MANAGER') {
    let managerDept = null;
    if (!isNaN(user.department)) {
      managerDept = await Department.findByPk(user.department);
    } else {
      managerDept = await Department.findOne({ where: { departmentName: user.department || '' } });
    }
    if (managerDept) {
       // Need to fetch leaves where employee's departmentId = managerDept.id
       const employees = await Employee.findAll({ where: { departmentId: managerDept.id }});
       const empIds = employees.map(e => e.id);
       whereClause.employeeId = empIds;
    } else {
       return [];
    }
  }

  return await LeaveRequest.findAll({
    where: whereClause,
    include: [{ model: Employee, as: 'employee' }],
    order: [['createdAt', 'DESC']]
  });
};

const updateStatus = async (user, id, status) => {
  const leave = await LeaveRequest.findByPk(id, {
    include: [{ model: Employee, as: 'employee' }]
  });
  
  if (!leave) throw new Error('Leave request not found');

  if (status === 'MANAGER_APPROVED') {
    leave.managerId = user.id;
  } else if (status === 'APPROVED' || status === 'REJECTED') {
    // If Admin/HR overriding or finalizing
    leave.hrId = user.id;
  }
  
  leave.status = status;
  await leave.save();

  // Create Notification
  let msg = `Your leave request from ${leave.startDate} to ${leave.endDate} has been ${status.replace('_', ' ').toLowerCase()}.`;
  
  // Need to find userId of the employee to notify them. 
  const User = require('../auth/user.model');
  const empUser = await User.findOne({ where: { email: leave.employee.email } });
  if (empUser) {
    await Notification.create({
      userId: empUser.id,
      title: 'Leave Update',
      message: msg,
      type: status === 'REJECTED' ? 'ERROR' : 'SUCCESS'
    });
  }

  return leave;
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateStatus
};
