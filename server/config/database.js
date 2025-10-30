// server/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para Render.com
const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    database: process.env.DB_NAME || 'lisport',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado correctamente');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados con PostgreSQL');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Reintentando en 10 segundos...');
      setTimeout(connectDB, 10000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = { connectDB, sequelize };