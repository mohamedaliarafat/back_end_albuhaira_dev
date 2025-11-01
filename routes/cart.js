const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { verifyPhone, verifyClient } = require('../middleware/verifyToken');

// ✅ المستخدم المسجل برقم الجوال فقط
router.post("/", verifyPhone, verifyClient, cartController.addProductToCart);
router.patch("/decrement/:id", verifyPhone, verifyClient, cartController.decrementProductQty);
router.delete("/:id", verifyPhone, verifyClient, cartController.removeCartItem);
router.get("/", verifyPhone, verifyClient, cartController.getCart);
router.get("/count", verifyPhone, verifyClient, cartController.getCartCount);

module.exports = router;
