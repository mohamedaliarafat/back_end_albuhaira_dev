const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  additives: { type: [String], default: [] },
  totalPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [cartItemSchema], default: [] }, // كل المنتجات داخل مصفوفة items
  totalPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);
