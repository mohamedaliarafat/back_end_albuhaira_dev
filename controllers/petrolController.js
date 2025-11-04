const Order = require('../models/Order');
const User = require('../models/User');

// 🛒 إنشاء طلب جديد
exports.createOrder = async (req, res) => {
  try {
    const { fuelType, fuelLiters, notes } = req.body;
    const userId = req.user.id; // 🧠 تم استخراجه من التوكن

    const order = new Order({
      user: userId,
      fuelType,
      fuelLiters,
      notes,
      status: 'pending',
    });

    await order.save();

    // تحديث سجل المستخدم لإضافة الطلب
    await User.findByIdAndUpdate(userId, { $push: { orders: order._id } });

    res.status(201).json({ success: true, message: 'تم إنشاء الطلب بنجاح', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إنشاء الطلب' });
  }
};

// 📦 جلب الطلبات الخاصة بالمستخدم الحالي
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};

// 🧑‍💼 تحديث حالة الطلب (للأدمن فقط)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ success: false, message: 'صلاحيات غير كافية' });
    }

    const { orderId } = req.params;
    const { status, price } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

    if (status) order.status = status;
    if (price) order.price = price;
    order.updatedAt = Date.now();

    await order.save();
    res.json({ success: true, message: 'تم تحديث حالة الطلب', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث حالة الطلب' });
  }
};

// 📋 جلب كل الطلبات (للأدمن فقط)
exports.getAllOrders = async (req, res) => {
  try {
    if (req.user.userType !== 'Admin') {
      return res.status(403).json({ success: false, message: 'صلاحيات غير كافية' });
    }

    const orders = await Order.find()
      .populate('user', 'phone profile userType')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};
