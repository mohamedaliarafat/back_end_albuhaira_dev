const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
        phone: uid, // نستخدم UID كرقم تعريف مؤقت
        phoneVerification: true,
        userType: "Admin",
        name: "Firebase Admin",
      });
      await admin.save();
    }

    // ✅ استجابة ناجحة
    return res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      token: uid,
      user: admin,
    });
  } catch (error) {
    console.error("❌ Firebase login error:", error);
    res.status(500).json({ success: false, message: "حدث خطأ في السيرفر" });
  }
});

module.exports = router;
