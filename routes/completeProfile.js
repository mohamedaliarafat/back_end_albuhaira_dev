// const express = require('express');
// const router = express.Router();
// const { createProfile, getProfile } = require('../controllers/companyProfileController');
// const authMiddleware = require('../middleware/authMiddleware'); // للتحقق من التوكن

// router.post('/create', authMiddleware, createProfile);
// router.get('/me', authMiddleware, getProfile);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { requestOtp, verifyOtpAndLogin, addAddress, getUserAddresses } = require('../controllers/userPhController');
const { completeProfile } = require('../controllers/profileController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtpAndLogin);
router.post("/add-address", addAddress);
router.get("/addresses/:userId", getUserAddresses);

// رفع الملفات وإكمال الملف الشخصي
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


module.exports = router;
