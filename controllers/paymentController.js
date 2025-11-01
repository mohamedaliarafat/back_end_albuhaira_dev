// const Payment = require("../models/payment");

// // 🟢 إنشاء عملية دفع جديدة
// const createPayment = async (req, res) => {
//   try {
//     // خُد بيانات المستخدم من التوكن اللي جاي من الـ middleware
//     const userId = req.user.id;
//     const userName = req.user.email || req.user.username || "Unknown User";

//     // بعد حفظ الدفع
// const newOrder = new Order({
//   userId: req.user.id,
//   orderItems: req.body.orderItems || [], // يمكن إرسال الأصناف من Flutter
//   orderTotal: totalAmount,
//   deliveryFee: req.body.deliveryFee || 0,
//   grandTotal: totalAmount + (req.body.deliveryFee || 0),
//   deliveryAddress: req.body.deliveryAddress || null,
//   restaurantAddress: req.body.restaurantAddress || "Default Address",
//   paymentMethod: bank || "Bank Transfer",
//   paymentStatus: "Pending",
//   orderStatus: "In-Review", // قيد الانتظار للموافقة
// });

// await newOrder.save();

//     res.status(201).json({ message: "✅ تم حفظ الطلب بنجاح", payment });
//   } catch (err) {
//     console.error("❌ خطأ أثناء إنشاء الدفع:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🟣 جلب كل الطلبات (للأدمن)
// const getAllPayments = async (req, res) => {
//   try {
//     const payments = await Payment.find().sort({ createdAt: -1 });
//     res.status(200).json(payments);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🔵 جلب الطلبات الخاصة بمستخدم واحد
// const getUserPayments = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
//     res.status(200).json(payments);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // 🟠 تحديث حالة الدفع (موافقة / رفض)
// const updatePaymentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const updated = await Payment.findByIdAndUpdate(id, { status }, { new: true });

//     if (!updated) {
//       return res.status(404).json({ message: "⚠️ الطلب غير موجود" });
//     }

//     res.json({ message: "✅ تم تحديث الحالة بنجاح", updated });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ التصدير النهائي للدوال
// module.exports = {
//   createPayment,
//   getAllPayments,
//   getUserPayments,
//   updatePaymentStatus,
// };

// controllers/paymentController.js
const path = require("path");
const fs = require("fs");
const Payment = require(path.join(__dirname, "../models/Payment"));
const Order = require(path.join(__dirname, "../models/Order"));
const User = require(path.join(__dirname, "../models/User"));

// استيراد الميدلوير الجديد (المعتمد على التوكن أو x-user-phone)
const { verifyPhone, verifyAdmin } = require(path.join(__dirname, "../middlewares/authMiddleware"));

// =======================
// Multer – إعداد التخزين
// =======================
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    const uniqueName = `${Date.now()}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/**
 * =======================
 * إنشاء عملية دفع جديدة + إنشاء طلب مرتبط
 * يتوقع أن middleware verifyPhone قد وضع req.user = { id, phone, userType }
 * =======================
 */
const createPayment = async (req, res) => {
  try {
    // التحقق من وجود المستخدم في req (يجب أن يكون middleware verifyPhone شغَّالًا قبل هذه الدالة)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: false, message: "غير مصرح. الرجاء تسجيل الدخول." });
    }

    const userId = req.user.id;

    // جلب الحقول من body
    const {
      totalAmount,
      currency = "SAR",
      bank = "Bank Transfer",
      iban = "",
      deliveryAddress = null,
      restaurantAddress = "Default Restaurant Address",
      orderItems = [], // اذا مرّ المستخدم عناصر الطلب من الواجهة
      deliveryFee = 0,
      notes = "",
      promoCode = "",
      discountAmount = 0,
    } = req.body;

    if (!totalAmount || isNaN(Number(totalAmount))) {
      return res.status(400).json({ status: false, message: "المبلغ الإجمالي (totalAmount) مطلوب وصحيح" });
    }

    const receiptFile = req.file ? req.file.filename : null;

    // حفظ الدفع
    const newPayment = new Payment({
      userId,
      totalAmount: Number(totalAmount),
      currency,
      bank,
      iban,
      status: "pending",
      receiptFile,
      notes,
      promoCode,
      discountAmount: Number(discountAmount) || 0,
    });

    await newPayment.save();

    // إنشاء طلب مرتبط بعد الدفع
    const newOrder = new Order({
      userId,
      orderItems: Array.isArray(orderItems) ? orderItems : [],
      orderTotal: Number(totalAmount) - Number(discountAmount) || Number(totalAmount),
      deliveryFee: Number(deliveryFee) || 0,
      grandTotal: (Number(totalAmount) - Number(discountAmount) || Number(totalAmount)) + (Number(deliveryFee) || 0),
      deliveryAddress: deliveryAddress || null,
      restaurantAddress,
      paymentMethod: bank || "Bank Transfer",
      paymentStatus: "Pending",
      orderStatus: "In-Review",
      notes,
    });

    await newOrder.save();

    // إرجاع استجابة واضحة
    res.status(201).json({
      status: true,
      message: "تم إرسال الدفع وإنشاء الطلب بنجاح. الطلب قيد المراجعة.",
      payment: newPayment,
      order: newOrder,
    });
  } catch (err) {
    console.error("❌ createPayment Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * =======================
 * عرض جميع المدفوعات (Admin)
 * =======================
 */
const getAllPayments = async (req, res) => {
  try {
    // تأكد أن النداء مر عبر middleware التحقق (مثلاً verifyAdmin) في الراوتر
    const payments = await Payment.find()
      .populate("userId", "username phone email") // populate الحقول المفيدة من المستخدم
      .sort({ createdAt: -1 });

    res.json({ status: true, payments });
  } catch (err) {
    console.error("❌ getAllPayments Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * =======================
 * عرض مدفوعات مستخدم محدد
 * =======================
 */
const getUserPayments = async (req, res) => {
  try {
    // userId يمكن أن يأتي من params أو من الـ req.user (الموصى به)
    const targetUserId = req.params.userId || (req.user && req.user.id);

    if (!targetUserId) {
      return res.status(400).json({ status: false, message: "مطلوب: userId" });
    }

    const payments = await Payment.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json({ status: true, payments });
  } catch (err) {
    console.error("❌ getUserPayments Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * =======================
 * تحديث حالة الدفع (Admin)
 * =======================
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "completed", "failed", "approved", "cancelled"];
    if (!status || !validStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({ status: false, message: `حالة غير صالحة. القيم المسموح بها: ${validStatuses.join(", ")}` });
    }

    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: String(status).toLowerCase() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ status: false, message: "الدفع غير موجود" });

    // — اختياري: عند إتمام الدفع قم بتحديث حالة الطلب المرتبط إن وُجد
    const relatedOrder = await Order.findOne({ userId: updated.userId, paymentMethod: updated.bank, orderTotal: updated.totalAmount }).sort({ createdAt: -1 });
    if (relatedOrder && String(status).toLowerCase() === "completed") {
      relatedOrder.paymentStatus = "Completed";
      relatedOrder.orderStatus = "Placed";
      await relatedOrder.save();
    }

    res.json({ status: true, message: "تم تحديث حالة الدفع", payment: updated });
  } catch (err) {
    console.error("❌ updatePaymentStatus Error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  upload,
  createPayment,
  getAllPayments,
  getUserPayments,
  updatePaymentStatus,
};
