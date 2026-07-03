require('dotenv').config();
const { sequelize } = require('../config/db');
const Employee = require('../modules/employee/employee.model');
const Department = require('../modules/department/department.model');
const { Op } = require('sequelize');

const seedEmployees = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Fetch required departments
    const deptNames = [
      'Administration', 'Human Resources (HR)', 'Information Technology (IT)', 
      'Engineering', 'Finance', 'Accounts', 'Sales', 'Marketing', 
      'Customer Support', 'Operations'
    ];
    
    // We map 'Human Resources' from prompt to 'Human Resources (HR)' as it exists in DB, etc.
    const departments = await Department.findAll({
      where: {
        departmentName: {
          [Op.in]: deptNames
        }
      }
    });

    if (departments.length === 0) {
      console.log('No departments found. Please run the department seeder first.');
      process.exit(1);
    }

    const designations = [
      'Software Engineer', 'Senior Software Engineer', 'HR Executive', 'HR Manager', 
      'Accountant', 'Finance Executive', 'Sales Executive', 'Marketing Executive', 
      'QA Engineer', 'Team Lead', 'Project Manager', 'Support Engineer', 
      'System Administrator', 'Operations Executive', 'Business Analyst'
    ];

    const indianNames = [
      { name: 'Aarav Sharma', gender: 'MALE' }, { name: 'Aditi Verma', gender: 'FEMALE' },
      { name: 'Vihaan Patel', gender: 'MALE' }, { name: 'Diya Reddy', gender: 'FEMALE' },
      { name: 'Arjun Singh', gender: 'MALE' }, { name: 'Ananya Gupta', gender: 'FEMALE' },
      { name: 'Sai Krishna', gender: 'MALE' }, { name: 'Ishita Desai', gender: 'FEMALE' },
      { name: 'Rohan Nair', gender: 'MALE' }, { name: 'Kavya Menon', gender: 'FEMALE' },
      { name: 'Krishna Iyer', gender: 'MALE' }, { name: 'Meera Rao', gender: 'FEMALE' },
      { name: 'Aryan Joshi', gender: 'MALE' }, { name: 'Rhea Kapoor', gender: 'FEMALE' },
      { name: 'Kabir Das', gender: 'MALE' }, { name: 'Pooja Bhat', gender: 'FEMALE' },
      { name: 'Dev Anand', gender: 'MALE' }, { name: 'Neha Khanna', gender: 'FEMALE' },
      { name: 'Yash Agarwal', gender: 'MALE' }, { name: 'Sneha Jain', gender: 'FEMALE' }
    ];

    for (let i = 0; i < 20; i++) {
      const email = `employee${i + 1}@company.com`;
      const exists = await Employee.findOne({ where: { email } });
      
      if (!exists) {
        const randomDept = departments[Math.floor(Math.random() * departments.length)];
        const randomDesignation = designations[Math.floor(Math.random() * designations.length)];
        
        // Random joining date between 2023-01-01 and 2026-06-30
        const start = new Date('2023-01-01').getTime();
        const end = new Date('2026-06-30').getTime();
        const randomDate = new Date(start + Math.random() * (end - start)).toISOString().split('T')[0];
        
        // Random phone number 98XXXXXXX
        const randomPhone = '98' + Math.floor(10000000 + Math.random() * 90000000).toString();

        await Employee.create({
          fullName: indianNames[i].name,
          email: email,
          phone: randomPhone,
          gender: indianNames[i].gender,
          departmentId: randomDept.id,
          designation: randomDesignation,
          joiningDate: randomDate,
          status: 'ACTIVE'
        });
        console.log(`Created employee: ${indianNames[i].name} (${email})`);
      } else {
        console.log(`Employee already exists: ${email}`);
      }
    }

    console.log('\n--- Employee Seeding Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding employees:', error);
    process.exit(1);
  }
};

seedEmployees();
