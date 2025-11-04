const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

// ✅ الاتصال بقاعدة البيانات
mongoose
  .connect(process.env.MONGOURL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function createAdmin() {
  try {
    // 🔹 بيانات الأدمن
    const adminData = {
      name: "Super Admin",
      email: "admin@arafat.com", // ✏️ غيّر الإيميل كما تريد
      password: "123456", // ✏️ غيّر الباسورد
      userType: "Admin",
      phone: "+966510480939", // رقم شكلي فقط لأن الحقل مطلوب أحياناً
    };

    // 🔍 تحقق إن كان الأدمن موجود مسبقاً
    const existing = await User.findOne({ email: adminData.email });
    if (existing) {
      console.log("⚠️ Admin already exists with this email!");
      process.exit(0);
    }

    // 🧠 إنشاء الأدمن
    const admin = new User(adminData);
    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
