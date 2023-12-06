const path = require('path');
const ejs = require('ejs');
const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: options.from,
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  await transport.sendMail(mailOptions);
};

exports.sendVerificationOtpEmail = async (user, verificationDetails) => {
  try {
    const message = await ejs.renderFile(
      path.join(__dirname, './../views/emails/verify-otp.ejs'),
      {
        name: user.name,
        userVerificationOTP: verificationDetails.userVerificationOTP,
      }
    );

    await sendEmail({
      from: 'OneApp <info@oneapp.com>',
      to: user.email,
      subject: 'Account Verification',
      html: message,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.sendForgotPasswordEmail = async (user, resetUrl) => {
  try {
    const message = await ejs.renderFile(
      path.join(__dirname, './../views/emails/password-reset.ejs'),
      {
        name: user.name,
        resetUrl,
      }
    );

    await sendEmail({
      from: 'Appointment.app <info@inmeet.app>',
      to: user.email,
      subject: 'Reset password',
      html: message,
    });

    return "Email Success"
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
  }
};

exports.sendAccountDeletedEmail = async (user) => {
  try {
    await sendEmail({
      from: 'Healpro <info@healpro.com>',
      to: user.email,
      subject: 'Account deleted',
      html: `<p><strong>Hi, ${user.name}</strong></p><br><p>Your Healpro account with email <strong>${user.email}</strong> has been deleted successfully.</p>`
    });
  } catch (err) {
    console.log(err);
  }
};
