require('dotenv').config();
const { sequelize } = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fix() {
  await sequelize.authenticate();
  try {
    const newHash = await bcrypt.hash('Password123', 10);
    await sequelize.query(
      'UPDATE "Users" SET password = :hash, "forcePasswordChange" = false WHERE email = :email',
      { replacements: { hash: newHash, email: 'ehlakya@gmail.com' } }
    );
    console.log("Fixed ehlakya@gmail.com");
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
fix();
