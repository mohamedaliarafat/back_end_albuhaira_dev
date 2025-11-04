const express = require('express');
const router = express.Router();
const petrolController = require('../controllers/petrolController');
const { verifyPhone, verifyAdmin } = require('../middleware/verifyToken');

// 🔹 المستخدم العادي
router.post('/create', verifyPhone, petrolController.createOrder);
router.get('/my-orders', verifyPhone, petrolController.getUserOrders);

// 🔹 الأدمن فقط
router.get('/all', verifyPhone, verifyAdmin, petrolController.getAllOrders);
router.put('/update/:orderId', verifyPhone, verifyAdmin, petrolController.updateOrderStatus);

module.exports = router;
