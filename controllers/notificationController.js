const Notification = require("../models/Notification");
const User = require("../models/User");

/* ------------------------------------------------------------
 ✅ 1) جلب إشعارات مستخدم + broadcast
------------------------------------------------------------- */
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
      .limit(100)
      .lean();

    const formatted = notifications.map((n) => ({
      ...n,
      isRead: Array.isArray(n.readBy) && n.readBy.includes(userId),
    }));

    res.json({
      success: true,
      message: "تم جلب الإشعارات بنجاح ✅",
      count: formatted.length,
      notifications: formatted,
    });

  } catch (err) {
    console.error("❌ Get User Notifications Error:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإشعارات"
    });
  }
};

/* ------------------------------------------------------------
 ✅ 2) وضع جميع الإشعارات كمقروءة
------------------------------------------------------------- */
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    await Notification.updateMany(
      {
        $or: [
          { user: userId },
          { broadcast: true },
        ],
        readBy: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    res.json({
      success: true,
      message: "تم تحديد كل الإشعارات كمقروءة 📩",
    });

  } catch (err) {
    console.error("❌ Mark All As Read Error:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء تحديث الإشعارات"
    });
  }
};

/* ------------------------------------------------------------
 ✅ 3) إنشاء إشعار (عام / لمستخدم)
------------------------------------------------------------- */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, body, broadcast = false, meta = {} } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "العنوان والنص مطلوبان",
      });
    }

    if (!broadcast && !userId) {
      return res.status(400).json({
        success: false,
        message: "يجب إرسال userId للإشعار الخاص",
      });
    }

    // تحقق من وجود المستخدم
    if (!broadcast) {
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "المستخدم غير موجود",
        });
      }
    }

    const notification = await Notification.create({
      title,
      body,
      user: broadcast ? null : userId,
      broadcast,
      meta: meta || {},
    });

    if (!broadcast) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { notifications: notification._id }
      });
    }

    res.json({
      success: true,
      message: broadcast
        ? "تم إرسال إشعار عام ✅"
        : "تم إرسال إشعار للمستخدم ✅",
      notification,
    });

  } catch (err) {
    console.error("❌ Create Notification Error:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء إنشاء الإشعار"
    });
  }
};

/* ------------------------------------------------------------
 ✅ 4) جلب كل الإشعارات (للأدمن)
------------------------------------------------------------- */
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("user", "phone userType name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "تم جلب جميع الإشعارات 👑",
      count: notifications.length,
      notifications,
    });

  } catch (err) {
    console.error("❌ Get All Notifications Error:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب الإشعارات"
    });
  }
};
