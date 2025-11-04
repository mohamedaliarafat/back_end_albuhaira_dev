const express = require("express");
const router = express.Router();
const {
  requestOtp,
  verifyOtpAndLogin,
  addAddress,
  getUserAddresses,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require("../controllers/userPhController");
const { verifyAdmin } = require("../middleware/verifyToken"); // حماية مسارات الأدمن

// ===============================
// 📱 تسجيل الدخول والتحقق عبر OTP
// ===============================
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpAndLogin);

// ===============================
// 🏠 إدارة العناوين
// ===============================
router.post("/add-address", addAddress);
router.get("/addresses/:userId", getUserAddresses);

// ===============================
// 🔔 نظام الإشعارات
// ===============================

// 📬 جلب إشعارات المستخدم
router.get("/notifications/:userId", getUserNotifications);

// ✅ تعليم الإشعار كمقروء
router.put("/notifications/read/:notificationId", markNotificationAsRead);

// ❌ حذف إشعار
router.delete("/notifications/:notificationId", deleteNotification);

// ===============================
// 🛡️ صلاحيات الأدمن
// ===============================

// 👥 جلب جميع المستخدمين (Dashboard)
router.get("/admin/users", verifyAdmin, getAllUsers);

// 👑 جلب جميع المستخدمين مع كل بيانات الملف الشخصي والعناوين والكارت


// 🔒 تفعيل / تعطيل مستخدم (حظر)
router.put("/admin/user/:userId/toggle", verifyAdmin, toggleUserStatus);

// 🗑️ حذف مستخدم
router.delete("/admin/user/:userId", verifyAdmin, deleteUser);

module.exports = router;
