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

const upload = multer({ dest: 'uploads/' });

// ===============================
// 📱 تسجيل الدخول والتحقق عبر OTP
// ===============================
router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpAndLogin);

// ===============================
// 🏠 إدارة العناوين
// ===============================
router.post("/add-address", addAddress);
router.get("/addresses/:userId", getUserAddresses);

// ===============================
// 📝 رفع الملفات وإكمال الملف الشخصي
// ===============================
router.post(
  '/complete-profile',
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
router.get("/admin/complete-profiles", getAllCompleteProfiles);

module.exports = router;
