require('dotenv').config();
const { sequelize } = require('./src/config/db');

async function test() {
  await sequelize.authenticate();
  try {
    const [results] = await sequelize.query('SELECT id, email, password FROM "Users" ORDER BY id DESC LIMIT 5;');
    console.log("Passwords in DB:");
    console.log(results);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
test();
