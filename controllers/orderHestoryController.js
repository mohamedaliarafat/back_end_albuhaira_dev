const Order = require("../models/Order");

// 🟢 إنشاء طلب جديد
exports.createOrder = async (req, res) => {
  try {
    const { status, totalAmount, currency, isPast } = req.body;

    const newOrder = new Order({
      userId: req.user.id, // يأتي من التوكن
      status: status || "In-Delivery",
      totalAmount,
      currency: currency || "SAR",
      isPast: isPast || false,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 جلب جميع الطلبات لمستخدم معين
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟣 تحديث حالة الطلب (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, isPast } = req.body;
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status, isPast },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⚫ جلب كل الطلبات (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "userName").sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
