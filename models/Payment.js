const mongoose = require("mongoose");
const Counter = require("./Counter");

// =======================
// تعريف موديل الدفع (Payment)
// =======================
const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true, // فريد لضمان عدم تكرار رقم الطلب
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: false,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "SAR",
    },
    bank: {
      type: String,
      required: false,
    },
    iban: {
      type: String,
      required: false,
    },
    receiptFile: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// =======================
// توليد رقم الطلب تلقائي عند الحفظ
// =======================
paymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderId) {
    try {
      // ابحث عن العداد وعدّله أو أنشئه لو مش موجود
      const counter = await Counter.findOneAndUpdate(
        { name: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      // أنشئ رقم الطلب بناءً على قيمة العدّاد
      this.orderId = `ORD${String(counter.seq).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// =======================
// تصدير الموديل
// =======================
module.exports = mongoose.model("Payment", paymentSchema);
