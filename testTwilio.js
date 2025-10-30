const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testTwilio() {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: '+9665xxxxxxx', channel: 'sms' });
    console.log('✅ OTP sent:', verification);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testTwilio();
