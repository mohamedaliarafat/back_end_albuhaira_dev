const router = require('express').Router();
const foodController = require('../controllers/foodController');
const { verifyVendor } = require('../middleware/verifyToken');

// ✅ إضافة صنف جديد
router.post("/", verifyVendor, foodController.addFood);

// ✅ الحصول على صنف حسب ID
router.get("/:id", foodController.getFoodById);

// ✅ الحصول على أطعمة عشوائية حسب الكود
router.get("/random/:code", foodController.getRandomFood);


router.get("/byCode/:code", foodController.getAllFoodsByCode);

// ✅ البحث عن طعام
router.get("/search/:search", foodController.searchFood);

// ✅ الحصول على أطعمة حسب المطعم
router.get("/restaurant-foods/:id", foodController.getFoodsByRestaurant);


// ✅ الحصول على أطعمة حسب الفئة والكود
router.get("/category/:category/:code", foodController.getRandomFoodsByCategoryAndCode);

module.exports = router;
