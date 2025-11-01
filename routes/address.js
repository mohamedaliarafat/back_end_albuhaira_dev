const router = require('express').Router();
const addressController = require('../controllers/addressController');
const {  verifyPhone, verifyClient, verifyAdmin  } = require('../middleware/verifyToken');

// 🏠 إضافة عنوان جديد
router.post("/", verifyPhone, verifyClient, verifyAdmin, addressController.addAddress);

// 📦 جلب جميع العناوين للمستخدم
router.get("/all", verifyPhone, verifyClient, verifyAdmin, addressController.getAddress);

// 🌟 تعيين عنوان كافتراضي
router.patch("/default/:id", verifyPhone, verifyClient, verifyAdmin, addressController.setAddressDefault);

// 🗑️ حذف عنوان
router.delete("/:id", verifyPhone, verifyClient, verifyAdmin, addressController.deleteAddress);

// 🎯 جلب العنوان الافتراضي فقط
router.get("/default", verifyPhone, verifyClient, verifyAdmin, addressController.getDefaultAddress);

module.exports = router;
