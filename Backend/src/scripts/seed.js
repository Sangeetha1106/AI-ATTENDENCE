require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/db');
const User = require('../modules/auth/user.model');
const Department = require('../modules/department/department.model');

const seedUsers = async () => {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connected.');

    // Ensure models are synced
    await sequelize.sync();

    // Create a default department so the manager has something to manage
    let dept = await Department.findOne({ where: { departmentCode: 'ENG' } });
    if (!dept) {
      dept = await Department.create({
        departmentName: 'Engineering',
        departmentCode: 'ENG',
        description: 'Software Engineering Department',
        status: 'ACTIVE'
      });
      console.log('Created Engineering department.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Users to seed
    const users = [
      {
        fullName: 'Admin Superuser',
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'ADMIN'
      },
      {
        fullName: 'HR Manager',
        email: 'hr@test.com',
        password: hashedPassword,
        role: 'HR_MANAGER'
      },
      {
        fullName: 'Engineering Manager',
        email: 'manger@gmail.com',
        password: hashedPassword,
        role: 'DEPARTMENT_MANAGER',
        department: 'Engineering' // Must match the departmentName
      },
      {
        fullName: 'Test Employee',
        email: 'employee@test.com',
        password: hashedPassword,
        role: 'EMPLOYEE'
      }
    ];

    // Seed users
    for (const userData of users) {
      const exists = await User.findOne({ where: { email: userData.email } });
      if (!exists) {
        await User.create(userData);
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('\n--- Seeding Complete ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedUsers();
