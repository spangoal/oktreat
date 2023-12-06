const admin = require('../firebase/admin');

const sendNotification = async (options) => {
  const registrationToken = options.registrationToken;
  const payload = {
    notification: {
      title: options.title,
      body: options.description,
    },
  };

  await admin.messaging().sendToDevice(registrationToken, payload);
};

module.exports = sendNotification;
