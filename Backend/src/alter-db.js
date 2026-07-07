require('dotenv').config();
const { sequelize } = require('./config/db');
const initModels = require('./models/initModels');

const syncDb = async () => {
  try {
    console.log("Syncing database with alter: true...");
    await initModels();
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Database sync failed", error);
  } finally {
    process.exit(0);
  }
};

syncDb();
