const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Payment = require(path.join(__dirname, "../models/Payment"));
const Order = require(path.join(__dirname, "../models/Order")); // نموذج الطلب

const { verifyPhone, verifyClient, verifyAdmin } = require('../middleware/verifyToken');

const router = express.Router();

// =======================
// Multer – إعداد التخزين
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/");
    // إنشاء المجلد لو غير موجود
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// اسم الحقل مطابق تمامًا لما يتم إرساله من Flutter: 'receiptFile'
const upload = multer({ storage });

// =======================
// إنشاء عملية دفع جديدة + إنشاء طلب تلقائي
// =======================
router.post(
  "/",
  verifyPhone, verifyClient,
  upload.single("receiptFile"),
  async (req, res) => {
    try {
      const { totalAmount, currency, bank, iban, status } = req.body;
      const receiptFile = req.file ? req.file.filename : null;

      const newPayment = new Payment({
        userId: req.user.id, // استخرج userId من التوكن
        totalAmount,
        currency,
        bank,
        iban,
        status: status?.toLowerCase() || "pending",
        receiptFile,
      });

      await newPayment.save();

      // === إنشاء طلب جديد مرتبط بنفس المستخدم ===
      const newOrder = new Order({
        userId: req.user.id,
        status: "In-Delivery", // الطلب الجديد يكون قيد التوصيل
        totalAmount: newPayment.totalAmount,
        currency: newPayment.currency,
        isPast: false, // الطلب الحالي
      });
      await newOrder.save();

      res.status(201).json({
        message: "تم إرسال الدفع وإنشاء الطلب بنجاح",
        payment: newPayment,
        order: newOrder,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

// =======================
// عرض جميع المدفوعات (Admin فقط)
// =======================
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "userName");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// عرض مدفوعات مستخدم واحد
// =======================
router.get("/user/:userId", verifyPhone, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// تحديث حالة الدفع (Admin فقط)
// =======================
router.put("/:id/status", verifyAdmin, async (req, res) => {
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
});

module.exports = router;
