const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },

  // لو الإشعار موجه لمستخدم معين
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // لو broadcast = true => لكل المستخدمين (user = null)
  broadcast: { type: Boolean, default: false },

  // بيانات إضافية (رابط داخل التطبيق، type, payload...)
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // حالة المقروئية للمستخدم (للـ user المحدد) أو تجاه عدة مستخدمين
  // نستخدم مصفوفة للاحتفاظ بحالة المقروئية لكل مستخدم في حال broadcast
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // خيار إرسال فوري عبر FCM (لا يؤثر في قاعدة البيانات)
  sentViaFcm: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
