const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const host = process.env.HOST;
const service = process.env.SERVICE;
const port = Number(process.env.EMAIL_PORT) || 587;
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host,
  service,
  port,
  auth: { user, pass }
});

async function sendOtpEmail (email, userName, otp) {
  const mailOptions = {
    from: user,
    to: email,
    subject: 'One-Time Password (OTP) for Verification',
    html: `
      <p>Dear ${userName},</p>
      <p>Your one-time password (OTP) for verification is: <strong>${otp}</strong></p>
      <p>Please use this OTP to verify your account.</p>
      <p>This OTP expires in 5 minutes.</p>
      <p>Thank you,</p>
      <p>C&C Store</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully.');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
}

module.exports = sendOtpEmail;
