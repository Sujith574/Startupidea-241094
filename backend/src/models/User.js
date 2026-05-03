const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['user', 'deliveryPartner', 'admin'],
    default: 'user',
  },
  address: { type: String, default: '' },

  // Delivery partner specific fields
  vehicleType: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available',
  },
  currentLocation: {
    lat: { type: Number, default: 17.385 },
    lng: { type: Number, default: 78.4867 },
  },
  totalDeliveries: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },

  isProfileComplete: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('User', userSchema);
