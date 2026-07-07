require('dotenv').config();
const { sequelize } = require('../config/db');

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected for migration.');

    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.addColumn('Attendances', 'gpsAccuracy', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true
    });

    await queryInterface.addColumn('Attendances', 'device', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Attendances', 'browser', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Attendances', 'ipAddress', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    });

    console.log('Successfully added columns to Attendances table.');
    process.exit(0);
  } catch (err) {
    // If it fails because column already exists, that's fine
    console.error('Migration info:', err.message);
    process.exit(0);
  }
};

migrate();
