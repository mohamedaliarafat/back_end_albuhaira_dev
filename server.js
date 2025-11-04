const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors"); // ✅ أضفنا مكتبة CORS

// 🔹 استدعاء الملفات
const CategoryRoutes = require("./routes/category");
const RestaurantRoutes = require("./routes/restaurant");
const FoodRoutes = require("./routes/foods");
const RatingRoutes = require("./routes/rating");
const AddressRoutes = require("./routes/address");
const CartRoutes = require("./routes/cart");
const OrderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/paymentRoutes");
const UserPhRoutes = require("./routes/userPhRoutes");
const completeProfileRoutes = require("./routes/completeProfile");
const PetrolRoutes = require("./routes/petrol");
const notificationRoutes = require("./routes/notifications");
const adminFirebaseRoute = require("./routes/adminFirebaseRoute");
const adminRoutes = require("./routes/adminRoutes");

// 🔹 تحميل المتغيرات من .env
dotenv.config();

// 🔹 الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGOURL)
  .then(() => console.log("✅ Albuhaira Database Connected"))
  .catch((err) => console.log("❌ DB Connection Error:", err));

// ✅ إعداد CORS
app.use(cors({
  origin: [
    "http://localhost:3000", // لوحة التحكم على جهازك
    "https://admin-albuhaira.onrender.com", // (اختياري) لوحة التحكم بعد الرفع
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// 🔹 إعدادات أساسية
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 المسارات

app.use("/api/admin", adminRoutes);
app.use("/api/category", CategoryRoutes);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/foods", FoodRoutes);
app.use("/api/rating", RatingRoutes);
app.use("/api/address", AddressRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", UserPhRoutes);
app.use("/api/company-profile", completeProfileRoutes);
app.use("/api/petrol", PetrolRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminFirebaseRoute);


// ✅ اختبار سريع
app.get("/", (req, res) => {
  res.send("Albuhaira Backend is Live 🚀");
});

// 🔹 تشغيل السيرفر
const PORT = process.env.PORT || 6013;
app.listen(PORT, () => console.log(`🚀 Albuhaira Backend running on port ${PORT}`));
