const Notification = require("../models/Notification");
const User = require("../models/User");

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

    // نحدد حالة القراءة لكل إشعار
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
 * 🔹 وضع كل الإشعارات كمقروءة للمستخدم
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    await Notification.updateMany(
      {
        $or: [
          { user: userId },
          { broadcast: true }
        ],
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    res.json({
      success: true,
      message: "تم تحديد كل الإشعارات كمقروءة 📩",
    });
  } catch (err) {
    console.error("❌ Mark As Read Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 إنشاء إشعار جديد (مخصص أو عام)
 */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, body, broadcast = false, meta = {} } = req.body;

    if (!title || !body) {
      return res
        .status(400)
        .json({ success: false, message: "الحقول المطلوبة: العنوان والنص" });
    }

    if (!broadcast && !userId) {
      return res
        .status(400)
        .json({ success: false, message: "يجب تحديد المستخدم إذا لم يكن الإشعار عامًا" });
    }

    const notification = await Notification.create({
      title,
      body,
      user: broadcast ? null : userId,
      broadcast,
      meta,
    });

    res.json({
      success: true,
      message: broadcast
        ? "تم إرسال إشعار عام بنجاح ✅"
        : "تم إرسال إشعار للمستخدم بنجاح ✅",
      notification,
    });
  } catch (err) {
    console.error("❌ Create Notification Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🔹 جلب كل الإشعارات (للأدمن فقط)
 */
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "phone userType")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "تم جلب جميع الإشعارات بنجاح 👑",
      count: notifications.length,
      notifications,
    });
  } catch (err) {
    console.error("❌ Get All Notifications Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
