const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  // 📱 معلومات الاتصال
  phone: { type: String, required: true, unique: true },
  phoneVerification: { type: Boolean, default: false },

  // 👥 نوع المستخدم
  userType: { 
    type: String, 
    default: "Client", 
    enum: ["Client", "Admin", "Vendor", "Driver"] 
  },

  // 🖼️ الصورة الشخصية
  profile: { 
    type: String, 
    default: "https://a.top4top.io/p_356432nv81.png" 
  },

  // 🏷️ بيانات إضافية
  name: { type: String, default: "" },
  email: { type: String, default: "", trim: true },
  fcm: { type: String, default: "" }, // 🔔 إشعارات Firebase
  isActive: { type: Boolean, default: true }, // ✅ تفعيل/حظر المستخدم
  bannedReason: { type: String, default: "" }, // ❗ سبب الحظر (اختياري)
  lastLogin: { type: Date, default: null }, // 🕓 آخر تسجيل دخول

  // 🏠 العناوين
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
  defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },

  // 🛒 السلة والطلبات
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", default: null },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

  // 🏢 الملف التعريفي (للشركات أو البائعين)
  completeProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CompleteProfile", default: null },

  // 🔔 الإشعارات المرتبطة بالمستخدم
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],

}, { timestamps: true });

/**
 * 🔁 تحديث آخر تسجيل دخول عند التحقق من رقم الهاتف
 */
UserSchema.pre("save", function(next) {
  if (this.isModified("phoneVerification") && this.phoneVerification) {
    this.lastLogin = new Date();
  }
  next();
});

/**
 * ⚡ فهارس لتحسين الأداء في الاستعلامات الكبيرة
 */
UserSchema.index({ phone: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
