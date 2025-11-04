const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const { verifyPhone, verifyAdmin } = require("../middleware/verifyToken");

// ===============================
// 📋 جلب كل المستخدمين (خاص بالأدمن فقط)
// ===============================
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

// ===============================
// 🗑 حذف مستخدم — أدمن فقط
// ===============================
router.delete("/users/:id", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ التحقق من صحة الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID غير صالح" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    // ⚠️ هنا يمكن إضافة حذف ملفات Profile أو العناوين المرتبطة باليوزر

    res.status(200).json({ success: true, message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "خطأ أثناء حذف المستخدم",
      error: error.message,
    });
  }
});

// ===============================
// 🧩 تعديل نوع المستخدم (مثلاً تحويله إلى أدمن)
// ===============================
router.put("/users/:id/role", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    // ✅ التحقق من صحة الـ ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID غير صالح" });
    }

    // ✅ التأكد من أن نوع المستخدم صالح
    const allowedRoles = ["Client", "Vendor", "Admin", "Driver"];
    if (!allowedRoles.includes(userType)) {
      return res.status(400).json({ success: false, message: "نوع مستخدم غير صالح" });
    }

    const user = await User.findByIdAndUpdate(id, { userType }, { new: true });
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    res.status(200).json({
      success: true,
      message: "تم تحديث نوع المستخدم بنجاح",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تعديل نوع المستخدم",
      error: error.message,
    });
  }
});

module.exports = router;
