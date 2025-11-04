const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyPhone, verifyAdmin } = require("../middleware/verifyToken");

/**
 * 📋 جلب كل المستخدمين (خاص بالأدمن فقط)
 */
router.get("/users", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المستخدمين",
      error: error.message,
    });
  }
});

/**
 * 🗑 حذف مستخدم — أدمن فقط
 */
router.delete("/users/:id", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    res.status(200).json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطأ أثناء حذف المستخدم",
      error: error.message,
    });
  }
});

/**
 * 🧩 تعديل نوع المستخدم (مثلاً تحويله إلى أدمن)
 */
router.put("/users/:id/role", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const { userType } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { userType },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    res.status(200).json({
      success: true,
      message: "تم تحديث نوع المستخدم بنجاح",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تعديل نوع المستخدم",
      error: error.message,
    });
  }
});

module.exports = router;
