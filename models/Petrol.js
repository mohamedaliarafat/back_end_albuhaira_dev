const mongoose = require('mongoose');

const petrolSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fuelType: { type: String, required: true },
  fuelLiters: { type: Number, required: true },
  notes: { type: String },
  price: { type: Number },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
}, { timestamps: true });

// ✅ استخدم هذه الطريقة لتجنب الخطأ OverwriteModelError
module.exports = mongoose.models.Order || mongoose.model('Petrol', petrolSchema);
