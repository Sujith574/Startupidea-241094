const mongoose = require('mongoose');

const statusTimelineSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: String,
  updatedBy: String,
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },

  pickupAddress: { type: String, required: true },
  pickupCoords: {
    lat: { type: Number, default: 17.385 },
    lng: { type: Number, default: 78.4867 },
  },
  deliveryAddress: { type: String, required: true },
  deliveryCoords: {
    lat: { type: Number, default: 19.076 },
    lng: { type: Number, default: 72.8777 },
  },

  weight: { type: Number, required: true },
  dimensions: {
    length: { type: Number, default: 0 },
    width:  { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  parcelType: { type: String, default: 'General' },

  courier: { type: mongoose.Schema.Types.Mixed },

  status: {
    type: String,
    enum: ['CREATED', 'PARTNER_ASSIGNED', 'PICKED_UP', 'HANDED_TO_COURIER', 'IN_TRANSIT', 'DELIVERED'],
    default: 'CREATED',
  },
  statusTimeline: [statusTimelineSchema],

  deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deliveryPartnerName: { type: String, default: null },

  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

shipmentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
