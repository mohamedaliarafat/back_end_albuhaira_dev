const router = require('express').Router();
const { verifyPhone, verifyClient, verifyAdmin } = require('../middleware/verifyToken');
const Order = require('../models/Order');

// جلب الطلبات الحالية للمستخدم
router.get("/user/current", verifyPhone, verifyClient, verifyAdmin, async (req, res) => {
  const orders = await Order.find({ 
    userId: req.user.id,
    orderStatus: { $in: ["In-Review", "Placed", "Accepted", "Preparing", "Out_for_Delivery"] } 
  });
  res.json(orders);
});

// جلب الطلبات السابقة للمستخدم
router.get("/user/past", verifyPhone, verifyClient, verifyAdmin, async (req, res) => {
  const orders = await Order.find({ 
    userId: req.user.id,
    orderStatus: { $in: ["Delivered", "Cancelled"] } 
  });
  res.json(orders);
});

// تحديث حالة الطلب (Admin)
router.put("/:id/status", verifyPhone, verifyClient, verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
  res.json(updated);
});

module.exports = router;
