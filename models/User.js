const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      default: "Client",
      enum: ["Client", "Admin", "Driver"],
    },

    phone: { type: String, unique: true, sparse: true },
    phoneVerification: { type: Boolean, default: false },

    email: { type: String, trim: true, unique: true, sparse: true },

    password: { type: String, default: null, select: false },

    profile: {
      type: String,
      default: "https://a.top4top.io/p_356432nv81.png",
    },

    name: { type: String, default: "" },
    fcm: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    bannedReason: { type: String, default: "" },
    lastLogin: { type: Date, default: null },

    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },

    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", default: null },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    completeProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CompleteProfile", default: null },

    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified("phoneVerification") && this.phoneVerification) {
    this.lastLogin = new Date();
  }

  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
