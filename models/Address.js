const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  addressLine1: { type: String, default: '' },
  city: { type: String, default: '' },
  district: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  postalCode: { type: String, default: '' },
  isDefault: { type: Boolean, default: false },
  deliveryInstructions: { type: String, default: '' },
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.models.Address || mongoose.model('Address', AddressSchema);
