// const User = require('../models/User');

// const verifyPhone = async (req, res, next) => {
//   try {
//     const phone = req.headers['x-user-phone'];
//     if (!phone) return res.status(401).json({ status: false, message: "رقم الجوال مفقود" });

//     const user = await User.findOne({ phone });
//     if (!user) return res.status(401).json({ status: false, message: "المستخدم غير موجود" });

//     req.user = { id: user._id, phone: user.phone, userType: user.userType };
//     next();
//   } catch (err) {
//     res.status(500).json({ status: false, message: err.message });
//   }
// };

// const verifyAuthorization = (allowedRoles) => (req, res, next) => {
//   if (!req.user) return res.status(401).json({ status: false, message: "لم يتم التحقق من المستخدم" });
//   if (allowedRoles.includes(req.user.userType)) return next();
//   return res.status(403).json({ status: false, message: "غير مسموح لك بالوصول لهذه الصفحة" });
// };

// const verifyClient = verifyAuthorization(['Client', 'Admin', 'Vendor', 'Driver']);
// const verifyVendor = verifyAuthorization(['Vendor', 'Admin']);
// const verifyAdmin = verifyAuthorization(['Admin']);
// const verifyDriver = verifyAuthorization(['Driver']);

// module.exports = { verifyPhone, verifyClient, verifyVendor, verifyAdmin, verifyDriver };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🧠 التحقق من التوكن أو رقم الجوال
 */
const verifyPhone = async (req, res, next) => {
  try {
    // نحاول أولاً من الهيدر Authorization: Bearer token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const phoneHeader = req.headers['x-user-phone']; // احتياط في حالة بدون توكن

    let user;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {
        return res.status(401).json({ status: false, message: "التوكن غير صالح أو منتهي" });
      }
    } else if (phoneHeader) {
      user = await User.findOne({ phone: phoneHeader });
    } else {
      return res.status(401).json({ status: false, message: "يجب إرسال التوكن أو رقم الجوال" });
    }

    if (!user) return res.status(404).json({ status: false, message: "المستخدم غير موجود" });

    req.user = {
      id: user._id,
      phone: user.phone,
      userType: user.userType,
    };

    next();
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * 🔐 السماح حسب نوع المستخدم
 */
const verifyAuthorization = (allowedRoles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ status: false, message: "لم يتم التحقق من المستخدم" });

  if (allowedRoles.includes(req.user.userType)) return next();

  return res.status(403).json({ status: false, message: "غير مسموح لك بالوصول لهذه الصفحة" });
};

// أنواع التفويض المسموحة
const verifyClient = verifyAuthorization(['Client', 'Admin', 'Vendor', 'Driver']);
const verifyVendor = verifyAuthorization(['Vendor', 'Admin']);
const verifyAdmin = verifyAuthorization(['Admin']);
const verifyDriver = verifyAuthorization(['Driver']);

module.exports = { verifyPhone, verifyClient, verifyVendor, verifyAdmin, verifyDriver };
