const mongoose = require('mongoose');

const petrolSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fuelType: { type: String, required: true },
  fuelLiters: { type: Number, required: true },
  notes: { type: String, default: "" },
  price: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.models.Petrol || mongoose.model('Petrol', petrolSchema);
