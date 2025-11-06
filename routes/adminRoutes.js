// routes/adminRoutes.js
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
// 📋 جلب كل المستخدمين مع بيانات Profile (خاص بالأدمن فقط)
// ===============================
router.get("/users-with-profile", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    // إذا لديك علاقة Profile في الـ schema
    const users = await User.find()
      .sort({ createdAt: -1 })
      .populate("profile"); // عدّل "profile" حسب اسم الحقل في الـ schema

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users with profile:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب المستخدمين مع Profile",
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID غير صالح" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

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
// 🧩 تعديل نوع المستخدم (مثلاً Client / Admin / Vendor / Driver)
// ===============================
router.put("/users/:id/role", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID غير صالح" });
    }

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

// ===============================
// 🔄 تغيير حالة المستخدم (active / blocked)
// ===============================
router.put("/users/:id/toggle", verifyPhone, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID غير صالح" });
    }

    const user = await User.findById(id);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    const newStatus = user.status === "active" ? "blocked" : "active";
    user.status = newStatus;
    await user.save();

    res.status(200).json({
      success: true,
      message: `تم تغيير حالة المستخدم إلى "${newStatus}"`,
      user,
    });
  } catch (error) {
    console.error("❌ Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تغيير حالة المستخدم",
      error: error.message,
    });
  }
});

module.exports = router;
