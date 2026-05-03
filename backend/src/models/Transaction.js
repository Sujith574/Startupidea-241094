const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shipmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  courierPrice: { type: DataTypes.INTEGER, defaultValue: 0 },
  platformFee: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
  partnerEarning: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'refunded'),
    defaultValue: 'pending',
  },
  completedAt: { type: DataTypes.DATE, allowNull: true },
}, {
  timestamps: true,
});

module.exports = Transaction;
