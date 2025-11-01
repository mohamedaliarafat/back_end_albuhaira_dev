const express = require("express")
const app = express()
const dotenv  = require("dotenv");
const mongoose = require("mongoose");
const CategoryRoutes = require("./routes/category");
const RestaurantRoutes= require("./routes/restaurant");
const FoodRoutes= require("./routes/foods");
const RatingRoutes= require("./routes/rating");
// const AuthRoutes= require("./routes/auth");
// const userRoute = require('./routes/user');
const AddressRoutes= require("./routes/address");
const CartRoutes= require("./routes/cart");
const OrderRoutes= require("./routes/order");
const paymentRoutes = require("./routes/paymentRoutes");
const UserPhRoutes = require("./routes/userPhRoutes");


// const sendEmail = require('./utils/smtp_functiopm,n');
// const generateOtp= require('./utils/otp_generator');



dotenv.config();


mongoose.connect(process.env.MONGOURL)
.then(() => console.log("Albuhaira Database Connected"))
.catch((err) => console.log(err)
);

// const otp = generateOtp(); 

// console.log(otp);

// sendEmail('momen111985@gmail.com', otp)

app.use(express.json());
app.use(express.urlencoded({extended: true}));
// app.use("/", UserPhRoutes);
// app.use("/api/users", userRoute);
app.use("/api/category", CategoryRoutes);
app.use("/api/restaurant", RestaurantRoutes);
app.use("/api/foods", FoodRoutes);
app.use("/api/rating", RatingRoutes);
app.use("/api/address", AddressRoutes);
app.use("/api/cart", CartRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/auth', UserPhRoutes);


app.listen(process.env.PORT || 6013, () => console.log(`Albuhaira Backend is running on  ${process.env.PORT}!`))