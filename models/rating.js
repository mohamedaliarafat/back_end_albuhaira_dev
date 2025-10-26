const mongoose = require("mongoose");

const RatinSchema = new mongoose.Schema({
    userId: {type: String, require: true},
    ratingType: {type: String, require: true, enum: ['Restaurant', 'Driver', 'Food']},
    product: {type: String, require: true},
    rating: {type: Number, min: 1, max: 5},
});

module.exports = mongoose.model('Rating' , RatinSchema);