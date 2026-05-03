const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { isEmail: true },
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.ENUM('login', 'register'),
    defaultValue: 'login',
  },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = OTP;
