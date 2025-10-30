const path = require("path");
const fs = require("fs");
const Payment = require(path.join(__dirname, "../models/Payment"));
const Order = require(path.join(__dirname, "../models/Order"));
const { verifyTokenAndAuthorization, verifyAdmin } = require("../middleware/verifyToken");

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
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// =======================
// إنشاء عملية دفع جديدة + إنشاء طلب مرتبط
// =======================
const createPayment = async (req, res) => {
  try {
    const { totalAmount, currency, bank, iban, deliveryAddress, restaurantAddress } = req.body;
    const receiptFile = req.file ? req.file.filename : null;

    // حفظ الدفع
    const newPayment = new Payment({
      userId: req.user.id,
      totalAmount,
      currency: currency || "SAR",
      bank: bank || "Bank Transfer",
      iban: iban || "",
      status: "pending",
      receiptFile,
    });

    await newPayment.save();

    // إنشاء طلب مرتبط بعد الدفع
    const newOrder = new Order({
      userId: req.user.id,
      orderItems: [], // يمكن ملؤها لاحقًا حسب اختيار المستخدم
      orderTotal: totalAmount,
      deliveryFee: 0,
      grandTotal: totalAmount,
      deliveryAddress: deliveryAddress || null,
      restaurantAddress: restaurantAddress || "Default Restaurant Address",
      paymentMethod: bank || "Bank Transfer",
      paymentStatus: "Pending",
      orderStatus: "In-Review", // الطلب قيد المراجعة
    });

    await newOrder.save();

    res.status(201).json({
      message: "تم إرسال الدفع وإنشاء الطلب بنجاح. الطلب قيد المراجعة.",
      payment: newPayment,
      order: newOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// =======================
// عرض جميع المدفوعات (Admin)
// =======================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "userName");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// عرض مدفوعات مستخدم محدد
// =======================
const getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =======================
// تحديث حالة الدفع (Admin)
// =======================
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: status.toLowerCase() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  upload,
  createPayment,
  getAllPayments,
  getUserPayments,
  updatePaymentStatus,
};
