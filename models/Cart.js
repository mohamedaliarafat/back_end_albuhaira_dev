const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food', required: true },
  title: { type: String },          
  imageUrl: { type: String },       
  restaurant: {                      
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    name: String,
    time: String,
    coords: [Number],
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

// حساب totalPrice و quantity تلقائياً قبل الحفظ
CartSchema.pre('save', function (next) {
  let total = 0;
  let qty = 0;
  this.items.forEach(item => {
    total += item.totalPrice;
    qty += item.quantity;
  });
  this.totalPrice = total;
  this.quantity = qty;
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
