const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
    title: {type: String, require: true},
    time: {type: String, require: true},
    value: {type: String, require: true},
    imageUrl: {type: String, require: true},
    foods: {type: Array, default:[]},
    pickup: {type: Boolean, default: true},
    delivery: {type: Boolean, default: true},
    isAvailable: {type: Boolean, default: true},
    owner: {type: String, require: true},
    code: {type: String, require: true},
    logoUrl: {type: String, require: true},
    rating: {type: Number, min:1, max:5, default:3 },
    ratingCount: {type: String, default: "267"},
    verification: {type: String, default: "Pending", enum:["Pending", "Verified", "Rejected"]},
    verification: {type: String, default: "Your Company is under review. We will notify you once it is verified."},
    coords: {
        id: {type: String},
        latitude: {type: Number, require: true},
        longitude: {type: Number, require: true},
        latitudeDelta: {type: Number, default: "0.0122"},
        longitudeDelta: {type: Number, default: "0.0122"},
        address: {type: String, require: true},
        title: {type: String, require: true},
        

    }
});

module.exports = mongoose.model('Restaurant' , RestaurantSchema);