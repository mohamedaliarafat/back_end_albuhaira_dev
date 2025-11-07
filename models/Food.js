const mongoose = require("mongoose");

const FoodSchema = new mongoose.Schema({
    title: { type: String, required: true },
    time: { type: String, required: true },
    foodTags: { type: [String], required: true },
    foodType: { type: [String], required: true },
    category: { type: String, required: true },
    imageUrl: { type: [String], required: true },
    code: { type: String, required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Restaurant" },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    ratingCount: { type: String, default: "267" },
    isAvailable: { type: Boolean, default: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    additives: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.models.Food || mongoose.model('Food', FoodSchema);
