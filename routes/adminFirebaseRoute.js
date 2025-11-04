// routes/firebaseAuth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// 🔹 تسجيل دخول الأدمن عبر Firebase
router.post("/firebase-login", async (req, res) => {
  try {
    const { email, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ success: false, message: "البيانات غير مكتملة" });
    }

    // 🔍 تحقق إن الأدمن موجود
    let admin = await User.findOne({ email });

    // 🆕 إذا غير موجود، أنشئه
    if (!admin) {
      admin = new User({
        email,
        phone: uid, // UID كرقم تعريف مؤقت
        phoneVerification: true,
        userType: "Admin",
        name: "Firebase Admin",
      });
      await admin.save();
    }

    // ✅ إنشاء JWT للبك اند صالح للاستخدام مع middleware
    const token = jwt.sign(
      { id: admin._id.toString(), userType: admin.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // مدة الصلاحية: 7 أيام
    );

    // ✅ استجابة ناجحة
    return res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token, // هذا هو التوكن الذي يستخدمه الـ frontend لكل الطلبات
      user: {
        _id: admin._id,
        email: admin.email,
        name: admin.name,
        userType: admin.userType,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error("❌ Firebase login error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;
