const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'Food' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    additives: { type: Array, default: [] },
    instructions: { type: String, default: "" }
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: { type: [orderItemSchema], default: [] },
    orderTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    deliveryAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: false },
    restaurantAddress: { type: String, default: "" },
    paymentMethod: { type: String, default: "Bank Transfer" },
    paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Completed', 'Failed'] },
    orderStatus: { 
  type: String, 
  default: 'In-Review', // بدل 'Pending' بعد الدفع
  enum: ['In-Review', 'Placed', 'Accepted', 'Preparing', 'Delivered', 'Cancelled', 'Ready', 'Out_for_Delivery'] 
},
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: false },
    restaurantCoords: { type: [Number], default: [] },
    recipintCoords: { type: [Number], default: [] },
    delivreId: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    feedback: { type: String, default: "" },
    promoCode: { type: String, default: "" },
    discountAmount: { type: Number, default: 0 },
    notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
