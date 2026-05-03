const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pickupAddress: { type: DataTypes.TEXT, allowNull: false },
  pickupCoords: {
    type: DataTypes.JSONB,
    defaultValue: { lat: 17.385, lng: 78.4867 },
  },
  deliveryAddress: { type: DataTypes.TEXT, allowNull: false },
  deliveryCoords: {
    type: DataTypes.JSONB,
    defaultValue: { lat: 19.076, lng: 72.8777 },
  },
  weight: { type: DataTypes.DOUBLE, allowNull: false },
  dimensions: {
    type: DataTypes.JSONB,
    defaultValue: { length: 0, width: 0, height: 0 },
  },
  parcelType: { type: DataTypes.STRING, defaultValue: 'General' },
  courier: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('CREATED', 'PARTNER_ASSIGNED', 'PICKED_UP', 'HANDED_TO_COURIER', 'IN_TRANSIT', 'DELIVERED'),
    defaultValue: 'CREATED',
  },
  statusTimeline: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  deliveryPartnerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  deliveryPartnerName: { type: DataTypes.STRING, defaultValue: null },
  platformFee: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  timestamps: true,
});

module.exports = Shipment;
