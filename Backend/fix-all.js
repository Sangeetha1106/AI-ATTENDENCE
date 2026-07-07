require('dotenv').config();
const { sequelize } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fixAll() {
  await sequelize.authenticate();
  try {
    const newHash = await bcrypt.hash('Password123', 10);
    // Set ALL users to Password123 and forcePasswordChange = true
    await sequelize.query(
      'UPDATE "Users" SET password = :hash, "forcePasswordChange" = true WHERE role = \'EMPLOYEE\'',
      { replacements: { hash: newHash } }
    );
    console.log("Fixed all employee passwords to Password123 and forced password change.");
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
fixAll();
