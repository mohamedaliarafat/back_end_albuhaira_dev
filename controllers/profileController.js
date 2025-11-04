// controllers/profileController.js
const User = require('../models/User');
const CompleteProfile = require('../models/CompleteProfile');

/**
 * 🔹 رفع الملفات وإكمال الملف الشخصي
 */
exports.completeProfile = async (req, res) => {
  try {
    const userId = req.body.userId; // يجب أن يرسل العميل userId أو تأخذه من التوكن
    if (!userId) return res.status(400).json({ message: "UserId is required" });

    // رفع الملفات
    const files = {};
    if (req.files) {
      if (req.files['licenseBusiness']) files.licenseBusiness = req.files['licenseBusiness'][0].path;
      if (req.files['licenseEnergy']) files.energyLicense = req.files['licenseEnergy'][0].path;
      if (req.files['commercialRecord']) files.commercialRecord = req.files['commercialRecord'][0].path;
      if (req.files['taxNumber']) files.taxNumber = req.files['taxNumber'][0].path;
      if (req.files['nationalAddress']) files.nationalAddress = req.files['nationalAddress'][0].path;
      if (req.files['civilDefense']) files.civilDefenseLicense = req.files['civilDefense'][0].path;
    }

    // بيانات إضافية (مثال)
    const { companyName, companyPhone, email } = req.body;

    // إنشاء أو تعديل CompleteProfile
    let profile = await CompleteProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CompleteProfile({
        user: userId,
        ...files,
        companyName,
        companyPhone,
        email,
      });
    } else {
      Object.assign(profile, files, { companyName, companyPhone, email });
    }

    await profile.save();

    // ربطه بالمستخدم
    await User.findByIdAndUpdate(userId, { completeProfile: profile._id });

    res.status(200).json({ success: true, message: "Profile completed", profile });
  } catch (err) {
    console.error("❌ Complete Profile Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 جلب كل ملفات CompleteProfile مع بيانات المستخدم
 */
exports.getAllCompleteProfiles = async (req, res) => {
  try {
    const profiles = await CompleteProfile.find()
      .populate('user', 'phone userType') // هنا نعرض بيانات المستخدم المرتبط
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: "تم جلب جميع ملفات المستخدمين بنجاح",
      profiles,
    });
  } catch (err) {
    console.error("❌ Get All CompleteProfiles Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
