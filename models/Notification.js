const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "العنوان مطلوب"] 
  },

  body: { 
    type: String, 
    required: [true, "النص مطلوب"] 
  },

  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null 
  },

  broadcast: { 
    type: Boolean, 
    default: false 
  },

  // نوع الإشعار (system, login, admin, address, order, etc.)
  type: { type: String, default: "system" },

  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  readBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  sentViaFcm: { 
    type: Boolean, 
    default: false 
  },

}, { timestamps: true });

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ user: 1 });
notificationSchema.index({ broadcast: 1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
