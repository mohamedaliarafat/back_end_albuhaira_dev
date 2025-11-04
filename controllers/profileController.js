// const CompanyProfile = require('../models/CompanyProfile');
// const User = require('../models/User');

// exports.createProfile = async (req, res) => {
//   try {
//     const userId = req.user.id; // يجي من التوكن بعد تسجيل الدخول
//     const existingProfile = await CompanyProfile.findOne({ user: userId });
//     if (existingProfile) {
//       return res.status(400).json({ success: false, message: 'تم إنشاء الملف مسبقًا' });
//     }

//     const {
//       companyName,
//       email,
//       commercialLicense,
//       energyLicense,
//       commercialRecord,
//       taxNumber,
//       nationalAddress,
//       civilDefenseLicense
//     } = req.body;

//     const newProfile = new CompanyProfile({
//       user: userId,
//       companyName,
//       email,
//       commercialLicense,
//       energyLicense,
//       commercialRecord,
//       taxNumber,
//       nationalAddress,
//       civilDefenseLicense
//     });

//     await newProfile.save();

//     res.status(201).json({
//       success: true,
//       message: 'تم حفظ الملف بنجاح',
//       data: newProfile,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const profile = await CompanyProfile.findOne({ user: userId });
//     if (!profile) {
//       return res.status(404).json({ success: false, message: 'لم يتم العثور على الملف' });
//     }
//     res.status(200).json({ success: true, data: profile });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'خطأ في الخادم' });
//   }
// };

const User = require('../models/User');
const CompleteProfile = require('../models/CompleteProfile');
const fs = require('fs');
const path = require('path');

/**
 * 🔹 رفع المستندات وإكمال الملف الشخصي
 */
exports.completeProfile = async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({ success: false, message: 'الـ userId و email مطلوبان' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
    }

    const files = req.files; // multer middleware
    if (!files || Object.keys(files).length === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });
    }

    let profile = await CompleteProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CompleteProfile({ user: userId, email, documents: {} });
    } else {
      profile.email = email;
    }

    const docKeys = {
      licenseBusiness: 'رخصة النشاط التجاري',
      licenseEnergy: 'رخصة وزارة الطاقة',
      commercialRecord: 'السجل التجاري',
      taxNumber: 'الرقم الضريبي',
      nationalAddress: 'العنوان الوطني للمنشأة',
      civilDefense: 'رخصة الدفاع المدني',
    };

    for (const [key, label] of Object.entries(docKeys)) {
      if (files[label]) {
        profile.documents[key] = files[label][0].path; 
      }
    }

    await profile.save();

    res.json({
      success: true,
      message: 'تم رفع المستندات وإكمال الملف الشخصي بنجاح',
      redirect: 'MainScreen',
      profile,
    });
  } catch (err) {
    console.error('❌ CompleteProfile Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
