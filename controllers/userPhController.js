const mongoose = require("mongoose");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const CompleteProfile = require("../models/CompleteProfile");
const Notification = require("../models/Notification");
const { sendOtp, verifyOtp } = require("../utils/otp_service");
const jwt = require("jsonwebtoken");

/**
 * 🔹 إرسال OTP للمستخدم
 */
exports.requestOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({ success: false, message: "رقم الهاتف مطلوب" });

  try {
    await sendOtp(phone);
    res.json({ success: true, message: "تم إرسال رمز التحقق بنجاح" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 التحقق من OTP وتسجيل الدخول / إنشاء مستخدم
 */
exports.verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.status(400).json({ success: false, message: "رقم الهاتف وOTP مطلوبان" });

  try {
    const isValid = await verifyOtp(phone, otp);
    if (!isValid)
      return res.status(400).json({
        success: false,
        message: "رمز التحقق غير صحيح أو منتهي الصلاحية",
      });

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone,
        phoneVerification: true,
        userType: "Client",
      });

      const cart = await Cart.create({ userId: user._id });
      user.cart = cart._id;

      const completeProfile = await CompleteProfile.create({
        user: user._id,
        email: "",
        documents: {
          licenseBusiness: "",
          licenseEnergy: "",
          commercialRecord: "",
          taxNumber: "",
          nationalAddress: "",
          civilDefense: "",
        },
      });

      user.completeProfile = completeProfile._id;
      await user.save();

      await Notification.create({
        user: user._id,
        title: "مرحباً بك!",
        message: "تم إنشاء حسابك بنجاح 🎉",
        type: "system",
      });
    } else {
      user.phoneVerification = true;
      await user.save();

      if (!user.cart) {
        const cart = await Cart.create({ userId: user._id });
        user.cart = cart._id;
        await user.save();
      }

      let profileExists = await CompleteProfile.findOne({ user: user._id });
      if (!profileExists) {
        profileExists = await CompleteProfile.create({
          user: user._id,
          email: "",
          documents: {
            licenseBusiness: "",
            licenseEnergy: "",
            commercialRecord: "",
            taxNumber: "",
            nationalAddress: "",
            civilDefense: "",
          },
        });
        user.completeProfile = profileExists._id;
        await user.save();
      }

      await Notification.create({
        user: user._id,
        title: "تسجيل الدخول",
        message: "تم تسجيل دخولك بنجاح ✅",
        type: "login",
      });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user = await User.findById(user._id)
      .populate("addresses")
      .populate("cart")
      .populate("defaultAddress")
      .populate("completeProfile");

    const completeProfile = await CompleteProfile.findOne({ user: user._id });
    const profileCompleted =
      completeProfile &&
      completeProfile.email &&
      Object.values(completeProfile.documents).every((doc) => doc);

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        _id: user._id,
        phone: user.phone,
        phoneVerification: user.phoneVerification,
        userType: user.userType,
        profile: user.profile,
        addresses: user.addresses,
        defaultAddress: user.defaultAddress,
        profileCompleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    console.error("❌ OTP Login Error:", err);
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

    const user = await User.findById(userId).populate("completeProfile");
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    const completeProfile = await CompleteProfile.findById(user.completeProfile);
    const isProfileCompleted =
      completeProfile &&
      completeProfile.email &&
      Object.values(completeProfile.documents).every((doc) => doc);

    if (!isProfileCompleted) {
      return res.status(403).json({
        success: false,
        message: "يرجى إكمال الملف الشخصي أولاً قبل إضافة عنوان جديد",
      });
    }

    if (isDefault) await Address.updateMany({ userId }, { isDefault: false });

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

    await Notification.create({
      user: user._id,
      title: "عنوان جديد",
      message: "تمت إضافة عنوان جديد إلى حسابك 🏠",
      type: "address",
    });

    res.json({
      success: true,
      message: "تم إضافة العنوان بنجاح ✅",
      address: newAddress,
    });
  } catch (err) {
    console.error("❌ Add Address Error:", err);
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
      message: "تم جلب العناوين بنجاح",
      addresses,
    });
  } catch (err) {
    console.error("❌ Get Addresses Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🔔 إشعارات المستخدم
====================================================== */

/**
 * 🔹 جلب إشعارات مستخدم معين (تشمل broadcast)
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      $or: [
        { user: userId },
        { broadcast: true }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const userNotifications = notifications.map((notif) => ({
      ...notif,
      isRead: notif.readBy?.some(id => id.toString() === userId) || false,
    }));

    res.json({
      success: true,
      message: "تم جلب الإشعارات بنجاح ✅",
      count: userNotifications.length,
      notifications: userNotifications,
    });
  } catch (err) {
    console.error("❌ Get User Notifications Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 تعليم إشعار كمقروء
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification)
      return res.status(404).json({ success: false, message: "الإشعار غير موجود" });

    if (!notification.readBy) notification.readBy = [];
    if (!notification.readBy.includes(userId)) notification.readBy.push(userId);

    await notification.save();

    res.json({
      success: true,
      message: "تم تعليم الإشعار كمقروء ✅",
    });
  } catch (err) {
    console.error("❌ Mark Notification As Read Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 حذف إشعار
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    await Notification.findByIdAndDelete(notificationId);

    res.json({
      success: true,
      message: "تم حذف الإشعار بنجاح 🗑️",
    });
  } catch (err) {
    console.error("❌ Delete Notification Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🛠️ دوال المدير (Admin)
====================================================== */

/**
 * 👑 جلب جميع المستخدمين
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("addresses")
      .populate("cart")
      .populate("completeProfile")
      .select("-__v");

    res.json({
      success: true,
      message: "تم جلب جميع المستخدمين بنجاح",
      users,
    });
  } catch (err) {
    console.error("❌ Get Users Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🚫 حظر / تفعيل مستخدم
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    user.isActive = !user.isActive;
    await user.save();

    await Notification.create({
      user: user._id,
      title: user.isActive ? "تم تفعيل حسابك ✅" : "تم حظر حسابك 🚫",
      message: user.isActive
        ? "يمكنك الآن استخدام التطبيق بشكل طبيعي."
        : "تم حظر حسابك من قبل الإدارة.",
      type: "admin",
    });

    res.json({
      success: true,
      message: user.isActive ? "تم تفعيل المستخدم" : "تم حظر المستخدم",
      user,
    });
  } catch (err) {
    console.error("❌ Toggle User Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🗑️ حذف مستخدم بالكامل
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    await Promise.all([
      Cart.deleteOne({ _id: user.cart }),
      Address.deleteMany({ _id: { $in: user.addresses } }),
      CompleteProfile.deleteOne({ _id: user.completeProfile }),
      Notification.deleteMany({ user: user._id }),
      User.deleteOne({ _id: userId }),
    ]);

    res.json({ success: true, message: "تم حذف المستخدم وكل بياناته بنجاح" });
  } catch (err) {
    console.error("❌ Delete User Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
