const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyTokenAndAuthorization } = require('../middleware/verifyToken');

// ✅ Get User Profile
router.get("/", verifyTokenAndAuthorization, userController.getUser);

// ✅ Delete User
router.delete("/", verifyTokenAndAuthorization, userController.deleteUser);

// ✅ Verify Email Account using OTP
router.get("/verify/:otp", verifyTokenAndAuthorization, userController.verifyAccount);

// ✅ Verify Phone using OTP
router.post("/verify_phone/:phone", verifyTokenAndAuthorization, userController.verifyPhone);

module.exports = router;
