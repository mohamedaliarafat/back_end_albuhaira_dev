const express = require("express");
const router = express.Router();
const { requestOtp, verifyOtpAndLogin, addAddress, getUserAddresses } = require("../controllers/userPhController");

// 🔹 إرسال رمز التحقق
router.post("/request-otp", requestOtp);

// 🔹 التحقق من الرمز وتسجيل الدخول
router.post("/verify-otp", verifyOtpAndLogin);

// 🔹 إضافة عنوان للمستخدم
router.post("/add-address", addAddress);

// 🔹 جلب عناوين المستخدم
router.get("/addresses/:userId", getUserAddresses);

module.exports = router;
