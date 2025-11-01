// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// module.exports = {

//     // ✅ Get User Profile
//     getUser: async (req, res) => {
//         try {
//             const user = await User.findById(req.user.id);

//             if (!user) {
//                 return res.status(404).json({ status: false, message: "User not found" });
//             }

//             // ✅ استخدم user._doc وليس user_doc
//             const { password, __v, createdAt, otp, ...userData } = user._doc;

//             res.status(200).json({ status: true, data: userData });
//         } catch (error) {
//             res.status(500).json({ status: false, message: error.message });
//         }
//     },

//     // ✅ Verify Email Account using OTP
//     verifyAccount: async (req, res) => {
//         const userOtp = req.params.otp;

//         try {
//             const user = await User.findById(req.user.id);

//             if (!user) {
//                 return res.status(404).json({ status: false, message: "User not found" });
//             }

//             if (userOtp === user.otp) {
//                 user.verification = true;
//                 user.otp = "none";
//                 await user.save();

//                 const { password, __v, otp, createdAt, ...other } = user._doc;
//                 return res.status(200).json({ status: true, data: other });
//             } else {
//                 return res.status(400).json({ status: false, message: "OTP verification failed" });
//             }
//         } catch (error) {
//             res.status(500).json({ status: false, message: error.message });
//         }
//     },

//     // ✅ Verify Phone Number with OTP
//     verifyPhone: async (req, res) => {
//         const { otp: userOtp, phone } = req.body;

//         try {
//             const user = await User.findById(req.user.id);

//             if (!user) {
//                 return res.status(404).json({ status: false, message: "User not found" });
//             }

//             if (userOtp === user.otp) {
//                 user.phoneVerification = true;
//                 user.phone = phone;
//                 await user.save();

//                 const { password, __v, otp, createdAt, ...other } = user._doc;
//                 return res.status(200).json({ status: true, data: other });
//             } else {
//                 return res.status(400).json({ status: false, message: "OTP verification failed" });
//             }
//         } catch (error) {
//             res.status(500).json({ status: false, message: error.message });
//         }
//     },

//     // ✅ Delete User
//     deleteUser: async (req, res) => {
//         try {
//             const deleted = await User.findByIdAndDelete(req.user.id);

//             if (!deleted) {
//                 return res.status(404).json({ status: false, message: "User not found" });
//             }

//             res.status(200).json({ status: true, message: "User successfully deleted" });
//         } catch (error) {
//             res.status(500).json({ status: false, message: error.message });
//         }
//     }

// };
