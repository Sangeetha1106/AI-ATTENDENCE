require('dotenv').config();
const { sequelize } = require('./src/config/db');

async function test() {
  await sequelize.authenticate();
  try {
    const [results] = await sequelize.query('SELECT id, email, "fullName" FROM "Employees" ORDER BY id DESC LIMIT 5;');
    console.log("Employees in DB:");
    console.log(results);
  } catch(e) {
    console.error(e);
  }
  process.exit();
}
test();
