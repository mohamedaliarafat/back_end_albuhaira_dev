const express = require("express");
const router = express.Router();

const {
  requestOtp,
  verifyOtpOnly,        // تم تعديل الاسم ليتوافق مع controller
  addAddress,
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} = require("../controllers/userPhController");

const { verifyPhone, verifyAdmin } = require("../middleware/verifyToken");

// ===============================
// 📱 تسجيل الدخول والتحقق عبر OTP
// ===============================
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpOnly);  // تم تعديل الاسم

// ===============================
// 🏠 إدارة العناوين
// ===============================
// يجب على المستخدم التحقق من الهاتف أولاً
router.post("/add-address", verifyPhone, addAddress);

// ===============================
// 🔔 نظام الإشعارات
// ===============================
router.get("/notifications/:userId", verifyPhone, getUserNotifications);
router.put("/notifications/read/:notificationId", verifyPhone, markNotificationAsRead);
router.delete("/notifications/:notificationId", verifyPhone, deleteNotification);

// ===============================
// 🛡️ صلاحيات الأدمن
// ===============================
router.get("/admin/users", verifyPhone, verifyAdmin, getAllUsers);
router.put("/admin/user/:userId/toggle", verifyPhone, verifyAdmin, toggleUserStatus);
router.delete("/admin/user/:userId", verifyPhone, verifyAdmin, deleteUser);

module.exports = router;
