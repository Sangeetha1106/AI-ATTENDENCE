require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./config/db');
const initModels = require('./models/initModels');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database Connected Successfully');
    
    // Initialize associations and sync database
    await initModels();
    console.log('Database models synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

startServer();
