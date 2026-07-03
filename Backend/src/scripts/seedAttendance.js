require('dotenv').config();
const { sequelize } = require('../config/db');
const Employee = require('../modules/employee/employee.model');
const Attendance = require('../modules/attendance/attendance.model');

const seedAttendance = async () => {
  try {
    await sequelize.authenticate();
    const employees = await Employee.findAll();
    
    const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'ON_DUTY', 'LEAVE'];
    
    // Generate for last 7 days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      for (const emp of employees) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        await Attendance.findOrCreate({
          where: { employeeId: emp.id, attendanceDate: dateString },
          defaults: {
            departmentId: emp.departmentId,
            status: randomStatus,
            createdBy: 1 // Admin user ID
          }
        });
      }
    }

    console.log('Attendance seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding attendance:', error);
    process.exit(1);
  }
};

seedAttendance();
