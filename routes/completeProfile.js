// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const { 
  requestOtp, 
  verifyOtpAndLogin, 
  addAddress, 
  getUserAddresses 
} = require('../controllers/userPhController');

const { 
  completeProfile, 
  getAllCompleteProfiles 
} = require('../controllers/profileController');

const { verifyPhone, verifyAdmin } = require('../middleware/verifyToken');

// ===============================
// 🔹 إعدادات multer لرفع الملفات
// ===============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // مجلد رفع الملفات
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===============================
// 📱 تسجيل الدخول والتحقق عبر OTP
// ===============================
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpAndLogin);

// ===============================
// 🏠 إدارة العناوين
// ===============================
router.post("/add-address", verifyPhone, addAddress);
router.get("/addresses/:userId", verifyPhone, getUserAddresses);

// ===============================
// 📝 رفع الملفات وإكمال الملف الشخصي
// ===============================
router.post(
  '/complete-profile',
  verifyPhone,
  upload.fields([
    { name: 'licenseBusiness', maxCount: 1 },
    { name: 'licenseEnergy', maxCount: 1 },
    { name: 'commercialRecord', maxCount: 1 },
    { name: 'taxNumber', maxCount: 1 },
    { name: 'nationalAddress', maxCount: 1 },
    { name: 'civilDefense', maxCount: 1 },
  ]),
  completeProfile
);

// ===============================
// 🛡️ صلاحيات الأدمن
// ===============================
// جلب كل ملفات CompleteProfile مع بيانات المستخدم
router.get("/admin/complete-profiles", verifyPhone, verifyAdmin, getAllCompleteProfiles);

module.exports = router;
