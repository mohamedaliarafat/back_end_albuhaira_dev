const User = require('../models/User');
const Cart = require('../models/Cart');
const { sendOtp, verifyOtp } = require('../utils/otp_service');
const jwt = require('jsonwebtoken');

/**
 * إرسال OTP
 */
exports.requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'رقم الهاتف مطلوب' });

  try {
    await sendOtp(phone);
    res.json({ message: 'تم إرسال رمز التحقق' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * التحقق من OTP وتسجيل الدخول مع JWT
 */
exports.verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: 'رقم الهاتف وOTP مطلوب' });

  try {
    const isValid = await verifyOtp(phone, otp);
    if (!isValid) return res.status(400).json({ message: 'رمز التحقق غير صحيح' });

    let user = await User.findOne({ phone });

    if (!user) {
      // إنشاء Cart فارغ
      const cart = await Cart.create({ userId: null });
      // إنشاء مستخدم جديد
      user = await User.create({
        phone,
        phoneVerification: true,
        userType: 'Client',
        cart: cart._id,
        addresses: [],
      });
      cart.userId = user._id;
      await cart.save();
    } else {
      user.phoneVerification = true;
      await user.save();
    }

    // إنشاء JWT Token
    const token = jwt.sign(
      { id: user._id, phone: user.phone, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // مدة الصلاحية 7 أيام
    );

    // populate آمن
    await user.populate([
      { path: 'addresses', strictPopulate: false },
      { path: 'cart', strictPopulate: false },
    ]);

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token, // ✅ إرسال التوكن مع الاستجابة
      user,
    });
  } catch (err) {
    console.error('❌ OTP Login Error:', err);
    res.status(500).json({ message: err.message });
  }
};
