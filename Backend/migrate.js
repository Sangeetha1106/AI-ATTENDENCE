require('dotenv').config();
const { sequelize } = require('./src/config/db');

async function migrateData() {
  try {
    // Copy passwords from Users to Employees for matching emails
    await sequelize.query(`
      UPDATE "Employees" e
      SET password = u.password,
          role = 'EMPLOYEE'
      FROM "Users" u
      WHERE e.email = u.email AND u.role = 'EMPLOYEE';
    `);

    // Delete employees from Users table
    await sequelize.query(`
      DELETE FROM "Users" WHERE role = 'EMPLOYEE';
    `);

    console.log('Migration OK');
    process.exit(0);
  } catch (e) {
    console.error('Migration FAILED', e);
    process.exit(1);
  }
}

migrateData();
