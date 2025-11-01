// // const User = require('../models/User');
// // const Cart = require('../models/Cart');
// // const { sendOtp, verifyOtp } = require('../utils/otp_service');
// // const jwt = require('jsonwebtoken');

// // /**
// //  * 🔹 إرسال OTP للمستخدم
// //  */
// // exports.requestOtp = async (req, res) => {
// //   const { phone } = req.body;
// //   if (!phone) {
// //     return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });
// //   }

// //   try {
// //     await sendOtp(phone);
// //     res.json({ success: true, message: 'تم إرسال رمز التحقق بنجاح' });
// //   } catch (err) {
// //     console.error('❌ OTP Send Error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// // /**
// //  * 🔹 التحقق من OTP وتسجيل الدخول مع JWT
// //  */
// // exports.verifyOtpAndLogin = async (req, res) => {
// //   const { phone, otp } = req.body;
// //   if (!phone || !otp) {
// //     return res.status(400).json({
// //       success: false,
// //       message: 'رقم الهاتف و رمز التحقق OTP مطلوبان',
// //     });
// //   }

// //   try {
// //     // ✅ التحقق من صحة رمز OTP
// //     const isValid = await verifyOtp(phone, otp);
// //     if (!isValid) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'رمز التحقق غير صحيح أو منتهي الصلاحية',
// //       });
// //     }

// //     // ✅ التحقق إذا كان المستخدم موجوداً
// //     let user = await User.findOne({ phone });

// //     if (!user) {
// //       // ✅ إنشاء مستخدم جديد
// //       user = await User.create({
// //         phone,
// //         phoneVerification: true,
// //         userType: 'Client',
// //         profile: 'https://a.top4top.io/p_356432nv81.png', // صورة افتراضية
// //         addresses: [],
// //       });

// //       // ✅ إنشاء سلة (Cart) مرتبطة بالمستخدم الجديد
// //       const cart = await Cart.create({ userId: user._id });

// //       // ✅ تحديث المستخدم بمرجع السلة
// //       user.cart = cart._id;
// //       await user.save();
// //     } else {
// //       // ✅ تحديث حالة التحقق من الهاتف
// //       user.phoneVerification = true;
// //       await user.save();

// //       // ✅ في حال لم يكن للمستخدم سلة، ننشئ له واحدة
// //       if (!user.cart) {
// //         const cart = await Cart.create({ userId: user._id });
// //         user.cart = cart._id;
// //         await user.save();
// //       }
// //     }

// //     // ✅ إنشاء JWT Token صالح لمدة 7 أيام
// //     const token = jwt.sign(
// //       { id: user._id, phone: user.phone, userType: user.userType },
// //       process.env.JWT_SECRET,
// //       { expiresIn: '7d' }
// //     );

// //     // ✅ تعبئة العلاقات (populate)
// //     await user.populate([
// //       { path: 'addresses', strictPopulate: false },
// //       { path: 'cart', strictPopulate: false },
// //     ]);

// //     // ✅ إرسال استجابة متوافقة مع Flutter
// //     res.json({
// //       success: true,
// //       message: 'تم تسجيل الدخول بنجاح',
// //       data: {
// //         _id: user._id,
// //         otp: 'none',
// //         fcm: 'none',
// //         phone: user.phone,
// //         phoneVerification: user.phoneVerification,
// //         userType: user.userType,
// //         profile: user.profile || '',
// //         createdAt: user.createdAt,
// //         updatedAt: user.updatedAt,
// //         __v: user.__v || 0,
// //       },
// //       token,
// //     });
// //   } catch (err) {
// //     console.error('❌ OTP Login Error:', err);
// //     res.status(500).json({ success: false, message: err.message });
// //   }
// // };

// const User = require('../models/User');
// const Cart = require('../models/Cart');
// const Address = require('../models/Address');
// const { sendOtp, verifyOtp } = require('../utils/otp_service');
// const jwt = require('jsonwebtoken');

// /**
//  * 🔹 إرسال OTP
//  */
// exports.requestOtp = async (req, res) => {
//   const { phone } = req.body;
//   if (!phone) return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

//   try {
//     await sendOtp(phone);
//     res.json({ success: true, message: 'تم إرسال رمز التحقق بنجاح' });
//   } catch (err) {
//     console.error('❌ OTP Send Error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * 🔹 التحقق من OTP وتسجيل الدخول مع JWT
//  */
// exports.verifyOtpAndLogin = async (req, res) => {
//   const { phone, otp } = req.body;
//   if (!phone || !otp)
//     return res.status(400).json({ success: false, message: 'رقم الهاتف وOTP مطلوب' });

//   try {
//     // ✅ التحقق من OTP
//     const isValid = await verifyOtp(phone, otp);
//     if (!isValid)
//       return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح' });

//     // ✅ إيجاد المستخدم أو إنشاؤه
//     let user = await User.findOne({ phone });

//     if (!user) {
//       user = await User.create({
//         phone,
//         phoneVerification: true,
//         userType: 'Client',
//         profile: 'https://a.top4top.io/p_356432nv81.png',
//       });

//       const cart = await Cart.create({ userId: user._id });
//       user.cart = cart._id;
//       await user.save();
//     } else {
//       user.phoneVerification = true;
//       await user.save();
//       if (!user.cart) {
//         const cart = await Cart.create({ userId: user._id });
//         user.cart = cart._id;
//         await user.save();
//       }
//     }

//     // ✅ إنشاء JWT
//     const token = jwt.sign(
//       { id: user._id, phone: user.phone, userType: user.userType },
//       process.env.JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     // ✅ تعبئة العلاقات
//     await user.populate([
//       { path: 'addresses', strictPopulate: false },
//       { path: 'cart', strictPopulate: false },
//       { path: 'defaultAddress', strictPopulate: false },
//     ]);

//     res.json({
//       success: true,
//       message: 'تم تسجيل الدخول بنجاح',
//       data: {
//         _id: user._id,
//         phone: user.phone,
//         phoneVerification: user.phoneVerification,
//         userType: user.userType,
//         profile: user.profile,
//         addresses: user.addresses,
//         defaultAddress: user.defaultAddress,
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       },
//       token,
//     });
//   } catch (err) {
//     console.error('❌ OTP Login Error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * 🏠 إضافة عنوان جديد للمستخدم
//  */
// exports.addAddress = async (req, res) => {
//   try {
//     const { userId, addressLine1, city, district, state, country, postalCode, isDefault, deliveryInstructions, latitude, longitude } = req.body;

//     // ✅ تأكد أن المستخدم موجود
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

//     // ✅ إنشاء العنوان
//     const newAddress = await Address.create({
//       userId,
//       addressLine1,
//       city,
//       district,
//       state,
//       country,
//       postalCode,
//       isDefault,
//       deliveryInstructions,
//       latitude,
//       longitude,
//     });

//     // ✅ إضافة العنوان للمستخدم
//     user.addresses.push(newAddress._id);
//     if (isDefault) user.defaultAddress = newAddress._id;
//     await user.save();

//     res.json({
//       success: true,
//       message: 'تم إضافة العنوان بنجاح',
//       address: newAddress,
//     });
//   } catch (err) {
//     console.error('❌ Add Address Error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// /**
//  * 📦 جلب جميع عناوين المستخدم
//  */
// exports.getUserAddresses = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const addresses = await Address.find({ userId });
//     res.json({
//       success: true,
//       message: 'تم جلب العناوين بنجاح',
//       addresses,
//     });
//   } catch (err) {
//     console.error('❌ Get Addresses Error:', err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// ✅ controllers/authController.js

const mongoose = require('mongoose');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const { sendOtp, verifyOtp } = require('../utils/otp_service');
const jwt = require('jsonwebtoken');

/**
 * 🔹 إرسال OTP للمستخدم
 */
exports.requestOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({ success: false, message: 'رقم الهاتف مطلوب' });

  try {
    await sendOtp(phone);
    res.json({ success: true, message: 'تم إرسال رمز التحقق بنجاح' });
  } catch (err) {
    console.error('❌ OTP Send Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 التحقق من OTP وتسجيل الدخول / إنشاء مستخدم
 */
exports.verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.status(400).json({ success: false, message: 'رقم الهاتف وOTP مطلوبان' });

  try {
    // ✅ التحقق من رمز OTP
    const isValid = await verifyOtp(phone, otp);
    if (!isValid)
      return res.status(400).json({ success: false, message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' });

    // ✅ إيجاد المستخدم أو إنشاؤه
    let user = await User.findOne({ phone });

    if (!user) {
      // إنشاء مستخدم جديد
      user = await User.create({
        phone,
        phoneVerification: true,
        userType: 'Client',
        profile: 'https://a.top4top.io/p_356432nv81.png',
        addresses: [],
        defaultAddress: null,
      });

      // إنشاء سلة مرتبطة بالمستخدم الجديد
      const cart = await Cart.create({ userId: user._id });
      user.cart = cart._id;
      await user.save();
    } else {
      // تحديث حالة التحقق من الهاتف
      user.phoneVerification = true;
      await user.save();

      // إنشاء سلة إذا لم تكن موجودة
      if (!user.cart) {
        const cart = await Cart.create({ userId: user._id });
        user.cart = cart._id;
        await user.save();
      }
    }

    // ✅ إنشاء JWT Token لمدة 7 أيام
    const token = jwt.sign(
      { id: user._id, phone: user.phone, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // تعبئة العلاقات
    user = await User.findById(user._id)
      .populate('addresses')
      .populate('cart')
      .populate('defaultAddress');

    // ✅ الاستجابة النهائية
    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      data: {
        _id: user._id,
        phone: user.phone,
        phoneVerification: user.phoneVerification,
        userType: user.userType,
        profile: user.profile,
        addresses: user.addresses,
        defaultAddress: user.defaultAddress,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    console.error('❌ OTP Login Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🏠 إضافة عنوان جديد للمستخدم
 */
exports.addAddress = async (req, res) => {
  try {
    const {
      userId,
      addressLine1,
      city,
      district,
      state,
      country,
      postalCode,
      isDefault,
      deliveryInstructions,
      latitude,
      longitude,
    } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });

    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId,
      addressLine1,
      city,
      district,
      state,
      country,
      postalCode,
      isDefault,
      deliveryInstructions,
      latitude,
      longitude,
    });

    user.addresses.push(newAddress._id);
    if (isDefault) user.defaultAddress = newAddress._id;
    await user.save();

    res.json({
      success: true,
      message: 'تم إضافة العنوان بنجاح',
      address: newAddress,
    });
  } catch (err) {
    console.error('❌ Add Address Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📦 جلب جميع عناوين المستخدم
 */
exports.getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId });

    res.json({
      success: true,
      message: 'تم جلب العناوين بنجاح',
      addresses,
    });
  } catch (err) {
    console.error('❌ Get Addresses Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
