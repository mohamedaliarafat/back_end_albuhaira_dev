const mongoose = require("mongoose");
const Counter = require("./Counter");

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: false },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "SAR" },
    bank: { type: String, required: false },
    iban: { type: String, required: false },
    receiptFile: { type: String, required: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

paymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderId) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.orderId = `ORD${String(counter.seq).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
