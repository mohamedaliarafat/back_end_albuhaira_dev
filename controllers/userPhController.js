const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Cart = require("../models/Cart");
const Address = require("../models/Address");
const CompleteProfile = require("../models/CompleteProfile");
const Notification = require("../models/Notification");

const { sendOtp, verifyOtp } = require("../utils/otp_service");

/* ======================================================
   🔹 إرسال OTP
====================================================== */
exports.requestOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res.status(400).json({ success: false, message: "رقم الهاتف مطلوب" });

  try {
    await sendOtp(phone);
    res.json({ success: true, message: "تم إرسال رمز التحقق بنجاح ✅" });
  } catch (err) {
    console.error("❌ OTP Send Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🔹 التحقق من OTP + تسجيل الدخول
====================================================== */
exports.verifyOtpAndLogin = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp)
    return res.status(400).json({
      success: false,
      message: "رقم الهاتف ورمز التحقق مطلوبان",
    });

  try {
    const isValid = await verifyOtp(phone, otp);
    if (!isValid)
      return res
        .status(400)
        .json({ success: false, message: "رمز التحقق غير صحيح أو منتهي" });

    let user = await User.findOne({ phone });

    /* 🚀 إنشاء مستخدم جديد */
    if (!user) {
      user = await User.create({
        phone,
        phoneVerification: true,
        userType: "Client",
      });

      const cart = await Cart.create({ userId: user._id });

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

      user.cart = cart._id;
      user.completeProfile = completeProfile._id;
      await user.save();

      // إشعار الترحيب
//       const notif = await Notification.create({
//   user: user._id,
//   title: "تسجيل دخول ناجح ✅",
//   body: "تم تسجيل دخولك إلى حسابك بنجاح.",
//   broadcast: false,
// });


      user.notifications = user.notifications || [];
      user.notifications.push(notif._id);
      await user.save();
    }

    /* ✅ مستخدم موجود */
    else {
      user.phoneVerification = true;
      await user.save();

      if (!user.cart) {
        const cart = await Cart.create({ userId: user._id });
        user.cart = cart._id;
        await user.save();
      }

      let profile = await CompleteProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await CompleteProfile.create({
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
        user.completeProfile = profile._id;
        await user.save();
      }

      // إشعار تسجيل الدخول
      const notif = await Notification.create({
        user: user._id,
        title: "تسجيل الدخول ✅",
        body: "تم تسجيل دخولك بنجاح",
        type: "login",
      });

      user.notifications = user.notifications || [];
      user.notifications.push(notif._id);
      await user.save();
    }

    /* 🎟️ إنشاء التوكن */
    const token = jwt.sign(
      { id: user._id, phone: user.phone, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user = await User.findById(user._id)
      .populate("addresses")
      .populate("cart")
      .populate("defaultAddress")
      .populate("completeProfile")
      .populate("notifications");

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح ✅",
      data: user,
      token,
    });
  } catch (err) {
    console.error("❌ OTP Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🔹 تسجيل دخول الأدمن
====================================================== */
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "البريد وكلمة المرور مطلوبان" });

  try {
    const user = await User.findOne({ email, userType: "Admin" }).select(
      "+password"
    );
    if (!user)
      return res.status(404).json({ success: false, message: "الأدمن غير موجود" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "كلمة المرور غير صحيحة" });

    const token = jwt.sign(
      { id: user._id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const notif = await Notification.create({
      user: user._id,
      title: "تسجيل دخول الأدمن 👑",
      body: "تم تسجيل الدخول بنجاح",
      type: "admin",
    });

    user.notifications = user.notifications || [];
    user.notifications.push(notif._id);
    await user.save();

    res.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح ✅",
      data: user,
      token,
    });
  } catch (err) {
    console.error("❌ Admin Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🏠 إدارة العناوين
====================================================== */
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

    const profile = await CompleteProfile.findById(user.completeProfile);

    const isProfileCompleted =
      profile &&
      profile.email &&
      Object.values(profile.documents).every((doc) => doc);

    if (!isProfileCompleted) {
      return res.status(403).json({
        success: false,
        message: "يرجى إكمال الملف الشخصي قبل إضافة عنوان جديد",
      });
    }

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

    const notif = await Notification.create({
      user: user._id,
      title: "عنوان جديد",
      body: "تمت إضافة عنوان جديد إلى حسابك 🏠",
      type: "address",
    });

    user.notifications = user.notifications || [];
    user.notifications.push(notif._id);
    await user.save();

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

exports.getUserAddresses = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId });

    res.json({
      success: true,
      message: "تم جلب العناوين بنجاح ✅",
      addresses,
    });
  } catch (err) {
    console.error("❌ Get Addresses Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ======================================================
   🔔 إدارة الإشعارات
====================================================== */
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({
      $or: [{ user: userId }, { broadcast: true }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const userNotifications = notifications.map((n) => ({
      ...n,
      isRead: n.readBy?.includes(userId) || false,
    }));

    res.json({
      success: true,
      message: "تم جلب الإشعارات بنجاح ✅",
      notifications: userNotifications,
    });
  } catch (err) {
    console.error("❌ Get Notifications Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const notif = await Notification.findById(notificationId);

    if (!notif)
      return res
        .status(404)
        .json({ success: false, message: "الإشعار غير موجود" });

    notif.readBy = notif.readBy || [];
    if (!notif.readBy.includes(userId)) notif.readBy.push(userId);

    await notif.save();

    res.json({ success: true, message: "تم تعليم الإشعار كمقروء ✅" });
  } catch (err) {
    console.error("❌ Read Notification Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

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
   👑 الأدمن — إدارة المستخدمين
====================================================== */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("addresses cart completeProfile notifications")
      .select("-__v");

    res.json({
      success: true,
      message: "تم جلب جميع المستخدمين ✅",
      users,
    });
  } catch (err) {
    console.error("❌ Get Users Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "المستخدم غير موجود" });

    user.isActive = !user.isActive;
    await user.save();

    // إشعار
    const notif = await Notification.create({
      user: user._id,
      title: user.isActive ? "تم تفعيل حسابك ✅" : "تم إيقاف حسابك 🚫",
      body: user.isActive
        ? "يمكنك استخدام التطبيق الآن"
        : "تم إيقاف حسابك من قبل الإدارة",
      type: "admin",
    });

    user.notifications = user.notifications || [];
    user.notifications.push(notif._id);
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "تم تفعيل المستخدم" : "تم إيقاف المستخدم",
    });
  } catch (err) {
    console.error("❌ Toggle User Status Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

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

    res.json({
      success: true,
      message: "تم حذف المستخدم وكل بياناته بنجاح ✅",
    });
  } catch (err) {
    console.error("❌ Delete User Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
