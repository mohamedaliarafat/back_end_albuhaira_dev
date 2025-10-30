// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//     phone: { type: String, required: true, unique: true },
//     phoneVerification: { type: Boolean, default: false },
//     userType: { type: String, default: "Client", enum: ['Client', 'Admin', 'Vendor','Driver'] },
//     profile: { type: String, default: 'https://a.top4top.io/p_356432nv81.png' },
//     addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
//     defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },
//     cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
//     orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
// }, { timestamps: true });

// module.exports = mongoose.model('User', UserSchema);


const UserSchema = new mongoose.Schema({
    phone: { type: String, required: true, unique: true },
    phoneVerification: { type: Boolean, default: false },
    userType: { type: String, default: "Client", enum: ['Client', 'Admin', 'Vendor','Driver'] },
    profile: { type: String, default: 'https://a.top4top.io/p_356432nv81.png' },
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", default: null },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);