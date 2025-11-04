const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getAllNotifications,
  markAllAsRead,
  createNotification,
} = require("../controllers/notificationController");
const {
  verifyPhone,
  verifyClient,
  verifyAdmin,
} = require("../middleware/verifyToken");

// 📱 المستخدم يشوف إشعاراته
router.get("/user/:userId", verifyPhone, verifyClient, getUserNotifications);

// 📩 وضع الكل كمقروء
router.post("/mark-read", verifyPhone, verifyClient, markAllAsRead);

// 👑 الأدمن يشوف كل الإشعارات
router.get("/admin/all", verifyPhone, verifyAdmin, getAllNotifications);

// 👑 الأدمن يرسل إشعار لمستخدم
router.post("/admin/create", verifyPhone, verifyAdmin, createNotification);

module.exports = router;
