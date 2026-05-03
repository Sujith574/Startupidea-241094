const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  name: { type: DataTypes.STRING, defaultValue: '' },
  phone: { type: DataTypes.STRING, defaultValue: '' },
  role: {
    type: DataTypes.ENUM('user', 'deliveryPartner', 'admin'),
    defaultValue: 'user',
  },
  address: { type: DataTypes.TEXT, defaultValue: '' },

  // Delivery partner specific fields
  vehicleType: { type: DataTypes.STRING, defaultValue: '' },
  licenseNumber: { type: DataTypes.STRING, defaultValue: '' },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'available',
  },
  lat: { type: DataTypes.DOUBLE, defaultValue: 17.385 },
  lng: { type: DataTypes.DOUBLE, defaultValue: 78.4867 },
  
  totalDeliveries: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalEarnings: { type: DataTypes.INTEGER, defaultValue: 0 },

  isProfileComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  timestamps: true,
});

module.exports = User;
