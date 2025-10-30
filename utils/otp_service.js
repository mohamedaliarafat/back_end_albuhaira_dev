// // utils/otp_service.js
// const twilio = require('twilio');
// require('dotenv').config();

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // إرسال OTP عبر Twilio Verify Service
// async function sendOtp(phone) {
//   try {
//     const verification = await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications.create({ to: phone, channel: 'sms' });

//     console.log(`✅ OTP sent to ${phone}`);
//     return verification.sid;
//   } catch (err) {
//     console.error('❌ Error sending OTP:', err.message);
//     throw new Error('فشل إرسال رمز التحقق');
//   }
// }

// // التحقق من كود OTP
// async function verifyOtp(phone, code) {
//   try {
//     const verificationCheck = await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verificationChecks.create({ to: phone, code });

//     console.log(`✅ Verification status: ${verificationCheck.status}`);
//     return verificationCheck.status === 'approved';
//   } catch (err) {
//     console.error('❌ Error verifying OTP:', err.message);
//     return false;
//   }
// }

// module.exports = { sendOtp, verifyOtp };


const twilio = require('twilio');
require('dotenv').config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

function formatPhone(phone) {
  phone = phone.trim();
  if (phone.startsWith('0')) return '+966' + phone.slice(1);
  if (phone.startsWith('+')) return phone;
  throw new Error('رقم الهاتف غير صالح: يجب أن يبدأ بـ 0 أو +رمز الدولة');
}

async function sendOtp(phone) {
  const formattedPhone = formatPhone(phone);
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: formattedPhone, channel: 'sms' });
    console.log(`✅ OTP sent to ${formattedPhone}`);
    return verification.sid;
  } catch (err) {
    console.error('❌ Error sending OTP:', err.message);
    throw err;
  }
}

async function verifyOtp(phone, code) {
  const formattedPhone = formatPhone(phone);
  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: formattedPhone, code });
    console.log(`🔹 Verification status for ${formattedPhone}: ${verificationCheck.status}`);
    return verificationCheck.status === 'approved';
  } catch (err) {
    console.error('❌ Error verifying OTP:', err.message);
    return false;
  }
}

module.exports = { sendOtp, verifyOtp };
