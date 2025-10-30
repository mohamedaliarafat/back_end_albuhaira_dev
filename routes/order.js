const router = require('express').Router();
const { verifyTokenAndAuthorization, verifyAdmin } = require('../middleware/verifyToken');
const Order = require('../models/Order');

// جلب الطلبات الحالية للمستخدم
router.get("/user/current", verifyTokenAndAuthorization, async (req, res) => {
  const orders = await Order.find({ 
    userId: req.user.id,
    orderStatus: { $in: ["In-Review", "Placed", "Accepted", "Preparing", "Out_for_Delivery"] } 
  });
  res.json(orders);
});

// جلب الطلبات السابقة للمستخدم
router.get("/user/past", verifyTokenAndAuthorization, async (req, res) => {
  const orders = await Order.find({ 
    userId: req.user.id,
    orderStatus: { $in: ["Delivered", "Cancelled"] } 
  });
  res.json(orders);
});

// تحديث حالة الطلب (Admin)
router.put("/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
  res.json(updated);
});

module.exports = router;
