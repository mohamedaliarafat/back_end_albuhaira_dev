const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratingType: { type: String, required: true, enum: ['Restaurant', 'Driver', 'Food'] },
    product: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.models.Rating || mongoose.model('Rating' , RatingSchema);
