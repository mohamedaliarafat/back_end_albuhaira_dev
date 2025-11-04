// controllers/profileController.js
const CompleteProfile = require('../models/CompleteProfile');
const User = require('../models/User');

// =====================================
// 📝 إكمال أو تعديل الملف الشخصي
// =====================================
exports.completeProfile = async (req, res) => {
  try {
    // 🔹 جلب userId من req.user (بعد verifyPhone middleware)
    const userId = req.user.id;

    // 🔹 رفع الملفات
    const files = {};
    if (req.files) {
      if (req.files['licenseBusiness']) files.licenseBusiness = req.files['licenseBusiness'][0].path;
      if (req.files['licenseEnergy']) files.licenseEnergy = req.files['licenseEnergy'][0].path;
      if (req.files['commercialRecord']) files.commercialRecord = req.files['commercialRecord'][0].path;
      if (req.files['taxNumber']) files.taxNumber = req.files['taxNumber'][0].path;
      if (req.files['nationalAddress']) files.nationalAddress = req.files['nationalAddress'][0].path;
      if (req.files['civilDefense']) files.civilDefense = req.files['civilDefense'][0].path;
    }

    const { email, companyName, companyPhone } = req.body;

    // 🔹 البحث عن CompleteProfile أو إنشاؤه
    let profile = await CompleteProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CompleteProfile({
        user: userId,
        email,
        companyName,
        companyPhone,
        documents: files
      });
    } else {
      profile.email = email || profile.email;
      profile.companyName = companyName || profile.companyName;
      profile.companyPhone = companyPhone || profile.companyPhone;
      profile.documents = { ...profile.documents, ...files };
    }

    await profile.save();

    // 🔹 ربطه بالمستخدم لو لم يكن مرتبطاً
    const user = await User.findById(userId);
    if (!user.completeProfile) {
      user.completeProfile = profile._id;
      await user.save();
    }

    res.json({ success: true, message: "تم إكمال الملف الشخصي بنجاح", profile });
  } catch (err) {
    console.error("❌ Complete Profile Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================
// 🛡️ جلب كل ملفات CompleteProfile للأدمن
// =====================================
exports.getAllCompleteProfiles = async (req, res) => {
  try {
    const profiles = await CompleteProfile.find()
      .populate('user', 'phone email'); // جلب بيانات المستخدم الأساسية
    res.json({ success: true, profiles });
  } catch (err) {
    console.error("❌ Get All Profiles Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// =====================================
// 👤 جلب ملف CompleteProfile لمستخدم محدد
// =====================================
exports.getUserCompleteProfile = async (req, res) => {
  try {
    const profile = await CompleteProfile.findOne({ user: req.params.userId })
      .populate('user', 'phone email');
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    res.json({ success: true, profile });
  } catch (err) {
    console.error("❌ Get User Profile Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
