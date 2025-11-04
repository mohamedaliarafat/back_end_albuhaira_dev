const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 🧠 التحقق من التوكن أو رقم الجوال (للأمان الأفضل)
 */
const verifyPhone = async (req, res, next) => {
  try {
    // ✅ جلب التوكن من الهيدر (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // ✅ احتياط: لو ما في توكن، نحاول من x-user-phone
    const phoneHeader = req.headers['x-user-phone'];

    let user;

    if (token) {
      try {
        // ✅ فك التوكن والتحقق من الصلاحية
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id);
      } catch (err) {
        return res
          .status(401)
          .json({ status: false, message: 'التوكن غير صالح أو منتهي الصلاحية' });
      }
    } else if (phoneHeader) {
      // ✅ لو المستخدم أرسل رقم الجوال فقط (وضع تطوير أو بديل)
      user = await User.findOne({ phone: phoneHeader });
    } else {
      return res
        .status(401)
        .json({ status: false, message: 'يجب إرسال التوكن أو رقم الجوال' });
    }

    // ✅ التحقق أن المستخدم موجود
    if (!user) {
      return res.status(404).json({ status: false, message: 'المستخدم غير موجود' });
    }

    // ✅ تخزين بيانات المستخدم في req.user لاستخدامها لاحقًا
    req.user = {
      id: user._id.toString(),
      phone: user.phone,
      userType: user.userType,
    };

    next();
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

/**
 * 🔐 التحقق من صلاحيات الوصول حسب نوع المستخدم
 */
const verifyAuthorization = (allowedRoles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ status: false, message: 'لم يتم التحقق من المستخدم' });

  if (allowedRoles.includes(req.user.userType)) return next();

  return res
    .status(403)
    .json({ status: false, message: 'غير مسموح لك بالوصول لهذه الصفحة' });
};

// ✅ صلاحيات محددة لأنواع المستخدمين
const verifyClient = verifyAuthorization(['Client', 'Admin', 'Vendor', 'Driver']);
const verifyVendor = verifyAuthorization(['Vendor', 'Admin']);
const verifyAdmin = verifyAuthorization(['Admin']);
const verifyDriver = verifyAuthorization(['Driver']);

module.exports = {
  verifyPhone,
  verifyClient,
  verifyVendor,
  verifyAdmin,
  verifyDriver,
};
