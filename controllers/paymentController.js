const Payment = require("../models/payment");

// 🟢 إنشاء عملية دفع جديدة
const createPayment = async (req, res) => {
  try {
    // خُد بيانات المستخدم من التوكن اللي جاي من الـ middleware
    const userId = req.user.id;
    const userName = req.user.email || req.user.username || "Unknown User";

    // بعد حفظ الدفع
const newOrder = new Order({
  userId: req.user.id,
  orderItems: req.body.orderItems || [], // يمكن إرسال الأصناف من Flutter
  orderTotal: totalAmount,
  deliveryFee: req.body.deliveryFee || 0,
  grandTotal: totalAmount + (req.body.deliveryFee || 0),
  deliveryAddress: req.body.deliveryAddress || null,
  restaurantAddress: req.body.restaurantAddress || "Default Address",
  paymentMethod: bank || "Bank Transfer",
  paymentStatus: "Pending",
  orderStatus: "In-Review", // قيد الانتظار للموافقة
});

await newOrder.save();

    res.status(201).json({ message: "✅ تم حفظ الطلب بنجاح", payment });
  } catch (err) {
    console.error("❌ خطأ أثناء إنشاء الدفع:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🟣 جلب كل الطلبات (للأدمن)
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 جلب الطلبات الخاصة بمستخدم واحد
const getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟠 تحديث حالة الدفع (موافقة / رفض)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Payment.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "⚠️ الطلب غير موجود" });
    }

    res.json({ message: "✅ تم تحديث الحالة بنجاح", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ التصدير النهائي للدوال
module.exports = {
  createPayment,
  getAllPayments,
  getUserPayments,
  updatePaymentStatus,
};
