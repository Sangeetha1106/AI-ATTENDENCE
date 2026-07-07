require('dotenv').config();
const { sequelize } = require('./src/config/db');

sequelize.query('ALTER TABLE "Employees" ADD COLUMN IF NOT EXISTS "password" VARCHAR(255) DEFAULT \'temp\'; ALTER TABLE "Employees" ADD COLUMN IF NOT EXISTS "role" VARCHAR(255) DEFAULT \'EMPLOYEE\';')
  .then(() => { 
    console.log('Database alter OK'); 
    process.exit(0); 
  })
  .catch(e => { 
    console.error('Database alter FAILED', e); 
    process.exit(1); 
  });
