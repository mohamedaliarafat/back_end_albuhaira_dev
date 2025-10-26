const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  addressLine1: { type: String, required: true }, // تصحيح الاسم
  city: { type: String, required: false },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }, // تغيير الاسم من "default"
  deliveryInstructions: { type: String, required: false },
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
}, { timestamps: true }); // يضيف createdAt و updatedAt تلقائياً

module.exports = mongoose.model("Address", AddressSchema);
