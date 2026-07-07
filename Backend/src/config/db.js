require('dotenv').config();
const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL && (!process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_USER || (!process.env.DB_PASSWORD && !process.env.DB_PASS))) {
  console.error("Error: Missing required database environment variables. Please provide either DATABASE_URL or DB_HOST, DB_NAME, DB_USER, DB_PASSWORD.");
  process.exit(1);
}

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS;
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, dbPassword, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
}

module.exports = { sequelize };
