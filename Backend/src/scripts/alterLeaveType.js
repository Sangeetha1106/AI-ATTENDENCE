require('dotenv').config();
const { sequelize } = require('../config/db');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected for migration.');
    
    // Drop existing ENUM constraint if possible (sometimes handled automatically, but safe to drop DEFAULT first)
    await sequelize.query('ALTER TABLE "LeaveRequests" ALTER COLUMN "leaveType" DROP DEFAULT;');
    
    // Change column type
    await sequelize.query(`ALTER TABLE "LeaveRequests" ALTER COLUMN "leaveType" TYPE VARCHAR(50) USING "leaveType"::VARCHAR;`);
    
    console.log('Successfully altered leaveType to VARCHAR(50)');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
