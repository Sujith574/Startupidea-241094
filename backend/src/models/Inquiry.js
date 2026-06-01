const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fromCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  toCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serviceType: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Domestic Moving',
  },
  status: {
    type: DataTypes.ENUM('NEW', 'CONTACTED', 'IN_PROGRESS', 'RESOLVED'),
    defaultValue: 'NEW',
  },
}, {
  timestamps: true,
});

module.exports = Inquiry;
