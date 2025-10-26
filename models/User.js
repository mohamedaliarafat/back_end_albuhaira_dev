const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {type: String, require: true},
    email: {type: String, require: true, unique: true},
    otp: {type: String, require: false, default: "none"},
    fcm: {type: String, required: false, default: "none"},
    password: {type: String, require: true},
    verification: {type: Boolean, require: false}, 
    phone: {type: String, default: "+966545123810"}, 
    phoneVerification: {type: Boolean, default: false}, 
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        require: false,
    },
    userType: {type: String, require: true, default: "Client", enum: ['Client', 'Admin', 'Vendor','Driver']},
    profile: {type: String, default: 'https://a.top4top.io/p_356432nv81.png'}
}, {timestamps: true});

module.exports = mongoose.model('User' , UserSchema);