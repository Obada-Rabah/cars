const admin = require('firebase-admin');
const serviceAccount = require('../path/to/your/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'YOUR_FIREBASE_DB_URL'
});

exports.sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};