const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courierPrice: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  partnerEarning: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'refunded'],
    default: 'pending',
  },
  completedAt: { type: Date, default: null },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

transactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

module.exports = mongoose.model('Transaction', transactionSchema);
