const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new twilio(accountSid, authToken);

const sendSMS = async (options) => {
  const smsOptions = {
    body: options.message,
    from: options.from,
    to: options.to,
  };

  await client.messages.create(smsOptions);
};

module.exports = sendSMS;
