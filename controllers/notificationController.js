const Notification = require("../models/Notification");
const User = require("../models/User");

/* ------------------------------------------------------------
 ✅ 1) جلب إشعارات مستخدم معين (تشمل broadcast)
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

    // تحديد حالة القراءة
    const formatted = notifications.map((n) => ({
      ...n,
      isRead: n.readBy?.includes(userId) || false,
    }));

    res.json({
      success: true,
      message: "تم جلب الإشعارات بنجاح ✅",
      count: formatted.length,
      notifications: formatted,
    });

  } catch (err) {
    console.error("❌ Get User Notifications Error:", err);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب الإشعارات" });
  }
};

/* ------------------------------------------------------------
 ✅ 2) وضع كل الإشعارات كمقروءة
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
    res.status(500).json({ success: false, message: "حدث خطأ أثناء التحديث" });
  }
};

/* ------------------------------------------------------------
 ✅ 3) إنشاء إشعار جديد (مستخدم معين / عام)
------------------------------------------------------------- */
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, body, broadcast = false, meta = {} } = req.body;

    // ✅ تحقق من الحقول المطلوبة
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "الحقول المطلوبة: العنوان والنص",
      });
    }

    // ✅ إذا الإشعار ليس broadcast، يجب وجود userId
    if (!broadcast && !userId) {
      return res.status(400).json({
        success: false,
        message: "يجب تحديد المستخدم إذا لم يكن الإشعار عامًا",
      });
    }

    const notification = await Notification.create({
      title,
      body,
      user: broadcast ? null : userId,
      broadcast,
      meta,
    });

    // ✅ إذا كان الإشعار لمستخدم معين — نربطه به
    if (!broadcast) {
      await User.findByIdAndUpdate(userId, {
        $push: { notifications: notification._id }
      });
    }

    res.json({
      success: true,
      message: broadcast
        ? "تم إرسال إشعار عام بنجاح ✅"
        : "تم إرسال إشعار للمستخدم بنجاح ✅",
      notification,
    });

  } catch (err) {
    console.error("❌ Create Notification Error:", err);
    res.status(500).json({
      success: false, message: "حدث خطأ أثناء إنشاء الإشعار"
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
      message: "تم جلب جميع الإشعارات بنجاح 👑",
      count: notifications.length,
      notifications,
    });

  } catch (err) {
    console.error("❌ Get All Notifications Error:", err);
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب جميع الإشعارات"
    });
  }
};
