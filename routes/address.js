const router = require('express').Router();
const addressController = require('../controllers/addressController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

// 🏠 إضافة عنوان جديد
router.post("/", verifyTokenAndAuthorization, addressController.addAddress);

// 📦 جلب جميع العناوين للمستخدم
router.get("/all", verifyTokenAndAuthorization, addressController.getAddress);

// 🌟 تعيين عنوان كافتراضي
router.patch("/default/:id", verifyTokenAndAuthorization, addressController.setAddressDefault);

// 🗑️ حذف عنوان
router.delete("/:id", verifyTokenAndAuthorization, addressController.deleteAddress);

// 🎯 جلب العنوان الافتراضي فقط
router.get("/default", verifyTokenAndAuthorization, addressController.getDefaultAddress);

module.exports = router;
