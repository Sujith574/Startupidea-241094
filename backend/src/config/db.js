const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not defined in environment variables');
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Render's managed databases
    },
  },
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected via Sequelize');
    
    // Sync models
    // In production, you might want to use migrations instead of sync({ alter: true })
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
