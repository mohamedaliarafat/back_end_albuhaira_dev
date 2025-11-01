// const Order = require("../models/Order");

// // 🟢 إنشاء طلب جديد
// exports.createOrder = async (req, res) => {
//   try {
//     const { status, totalAmount, currency, isPast } = req.body;

//     const newOrder = new Order({
//       userId: req.user.id, // يأتي من التوكن
//       status: status || "In-Delivery",
//       totalAmount,
//       currency: currency || "SAR",
//       isPast: isPast || false,
//     });

//     await newOrder.save();
//     res.status(201).json(newOrder);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🔵 جلب جميع الطلبات لمستخدم معين
// exports.getUserOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🟣 تحديث حالة الطلب (Admin)
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status, isPast } = req.body;
//     const updated = await Order.findByIdAndUpdate(
//       req.params.id,
//       { status, isPast },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ⚫ جلب كل الطلبات (Admin)
// exports.getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find().populate("userId", "userName").sort({ createdAt: -1 });
//     res.json(orders);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };



// controllers/orderController.js

const Order = require("../models/Order");

// 🟢 إنشاء طلب جديد (يتم عادة بعد الدفع أو اختيار الطعام)
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      orderTotal,
      deliveryFee,
      grandTotal,
      deliveryAddress,
      restaurantAddress,
      paymentMethod,
      restaurantId,
      restaurantCoords,
      recipintCoords,
      notes,
    } = req.body;

    // ✅ إنشاء الطلب الجديد
    const newOrder = new Order({
      userId: req.user.id, // رقم المستخدم يأتي من الـ JWT بعد تسجيل الدخول برقم الجوال
      orderItems: orderItems || [],
      orderTotal: orderTotal || 0,
      deliveryFee: deliveryFee || 0,
      grandTotal: grandTotal || 0,
      deliveryAddress: deliveryAddress || null,
      restaurantAddress: restaurantAddress || "",
      paymentMethod: paymentMethod || "Bank Transfer",
      paymentStatus: "Pending",
      orderStatus: "In-Review",
      restaurantId: restaurantId || null,
      restaurantCoords: restaurantCoords || [],
      recipintCoords: recipintCoords || [],
      notes: notes || "",
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "تم إنشاء الطلب بنجاح وهو الآن قيد المراجعة.",
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ Error creating order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🔵 جلب جميع الطلبات لمستخدم معين
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("orderItems.foodId", "name price image")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// 🟣 تحديث حالة الطلب (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }

    res.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Error updating order:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ⚫ جلب كل الطلبات (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "phone")
      .populate("orderItems.foodId", "name price image")
      .populate("deliveryAddress")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("❌ Error fetching all orders:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
