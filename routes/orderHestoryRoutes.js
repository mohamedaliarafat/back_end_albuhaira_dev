const express = require("express");
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/orderController");

const { verifyTokenAndAuthorization, verifyAdmin } = require("../middleware/verifyToken");

// 🟢 إنشاء طلب جديد
router.post("/", verifyTokenAndAuthorization, createOrder);

// 🔵 جلب جميع طلبات مستخدم محدد
router.get("/user/:userId", verifyTokenAndAuthorization, getUserOrders);

// 🟠 تحديث حالة الطلب (Admin فقط)
router.put("/:id/status", verifyAdmin, updateOrderStatus);

// ⚫ جلب كل الطلبات (Admin)
router.get("/", verifyAdmin, getAllOrders);

module.exports = router;
