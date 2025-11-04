const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // 👥 نوع المستخدم
    userType: {
      type: String,
      default: "Client",
      enum: ["Client", "Admin", "Driver"],
    },

    // 📱 رقم الجوال (إجباري للعملاء والسائقين)
    phone: { type: String, unique: true, sparse: true },
    phoneVerification: { type: Boolean, default: false },

    // 📧 البريد الإلكتروني (إجباري للأدمن)
    email: { type: String, trim: true, unique: true, sparse: true },

    // 🔑 كلمة المرور (للأدمن فقط)
    password: { type: String, default: null, select: false },

    // 🖼️ الصورة الشخصية
    profile: {
      type: String,
      default: "https://a.top4top.io/p_356432nv81.png",
    },

    // 🏷️ بيانات إضافية
    name: { type: String, default: "" },
    fcm: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    bannedReason: { type: String, default: "" },
    lastLogin: { type: Date, default: null },

    // 🏠 العناوين
    addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }],
    defaultAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },

    // 🛒 السلة والطلبات
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", default: null },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    // 🏢 الملف التعريفي (للشركات أو البائعين)
    completeProfile: { type: mongoose.Schema.Types.ObjectId, ref: "CompleteProfile", default: null },

    // 🔔 الإشعارات
    notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
  },
  { timestamps: true }
);

//
// 🔒 تشفير كلمة المرور قبل الحفظ
//
UserSchema.pre("save", async function (next) {
  // تشفير الباسورد فقط عند التعديل أو الإضافة
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // تحديث آخر دخول بعد التحقق من رقم الهاتف
  if (this.isModified("phoneVerification") && this.phoneVerification) {
    this.lastLogin = new Date();
  }

  next();
});

//
// 🧠 دالة لمقارنة الباسورد عند تسجيل الدخول
//
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//
// ⚡ تحسين الأداء بالفهارس
//
UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
