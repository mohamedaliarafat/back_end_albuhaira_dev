// مثال بسيط — تحتاج تثبيت firebase-admin وتكوينه
// npm i firebase-admin
const admin = require('firebase-admin');

if (!admin.apps.length) {
  // const serviceAccount = require('../path-to-service-account.json');
  // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  // أو admin.initializeApp(); مع إعدادات env
}

async function sendFcmToToken(token, payload) {
  if (!token) return;
  return admin.messaging().send({
    token,
    notification: { title: payload.title, body: payload.body },
    data: payload.data || {},
  });
}

async function sendFcmToMultiple(tokens, payload) {
  if (!tokens || !tokens.length) return;
  const message = {
    tokens,
    notification: { title: payload.title, body: payload.body },
    data: payload.data || {},
  };
  return admin.messaging().sendMulticast(message);
}

module.exports = { sendFcmToToken, sendFcmToMultiple };
