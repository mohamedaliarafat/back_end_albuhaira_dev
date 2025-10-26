const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    foodTags: { type: Array, required: true }, // صححت الاسم من fooTags
    foodType: { type: Array, required: true }, // صححت الاسم من fooType
    category: { type: String, required: true },
    imageUrl: { type: Array, required: true },
    code: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Restaurant" },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    ratingCount: { type: String, default: "267" },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    additives: { type: Array, default: [] },
}, { timestamps: true }); // timestamps لإضافة createdAt و updatedAt تلقائياً

module.exports = mongoose.model('Food', FoodSchema);
