// const mongoose = require("mongoose");
// const Counter = require("./Counter"); // عداد تلقائي للـ orderId

// const orderSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: String,
//       unique: true,
//     },
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["Completed", "In-Delivery", "Cancelled"],
//       default: "In-Delivery",
//     },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },
//     currency: {
//       type: String,
//       default: "SAR",
//     },
//     isPast: {
//       type: Boolean,
//       default: false, // الطلب الحالي false، الطلب السابق true
//     },
//   },
//   { timestamps: true }
// );

// // توليد رقم الطلب تلقائي
// orderSchema.pre("save", async function (next) {
//   if (this.isNew && !this.orderId) {
//     try {
//       const counter = await Counter.findOneAndUpdate(
//         { name: "orderId" },
//         { $inc: { seq: 1 } },
//         { new: true, upsert: true }
//       );
//       this.orderId = `ORD${String(counter.seq).padStart(4, "0")}`;
//       next();
//     } catch (err) {
//       next(err);
//     }
//   } else {
//     next();
//   }
// });

// module.exports = mongoose.model("Order", orderSchema);
