const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  title: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  restaurant: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    name: { type: String, default: "" },
    time: { type: String, default: "" },
    coords: { type: [Number], default: [] },
  },
  additives: { type: [String], default: [] },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [cartItemSchema], default: [] },
  totalPrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

CartSchema.pre('save', function (next) {
  let total = 0;
  let qty = 0;
  this.items.forEach(item => {
    total += Number(item.totalPrice || 0);
    qty += Number(item.quantity || 0);
  });
  this.totalPrice = total;
  this.quantity = qty;
  next();
});

module.exports = mongoose.models.Cart || mongoose.model('Cart', CartSchema);
