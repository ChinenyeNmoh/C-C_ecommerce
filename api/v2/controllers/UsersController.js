const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const User = require('../models/User');
const generateOTP = require('../utils/otp');
const sendOtpEmail = require('../utils/email');

const UsersController = {
  async postNew (req, res) {
    const { firstName, lastName, email, password, dateOfBirth } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) return res.status(400).json({ error: 'Email already exist' });

    const otp = generateOTP();
    const key = `otp_${email}`;
    const expirationTimeInSeconds = 300;

    await redisClient.set(key, otp, expirationTimeInSeconds);

    sendOtpEmail(email, `${firstName} ${lastName}`, otp);

    const newUser = new User({ email, password, firstName, lastName, dateOfBirth });

    const savedUser = await newUser.save();

    return res.status(201).json({ status: 'succesful', email: savedUser.email });
  },

  async getMe (req, res) {
    const token = req.headers['x-token'];
    const key = `auth_${token}`;

    const userId = await redisClient.get(key);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ email: user.email, id: user._id });
  },

  async verifyOtp (req, res) {
    console.log('in here');
    const { email, otp } = req.body;
    const key = `otp_${email}`;

    console.log(otp);

    const storedOtp = await redisClient.get(key);

    console.log(storedOtp);
    if (storedOtp !== String(otp)) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await redisClient.del(key);

    await User.updateOne({ email }, { $set: { verified: true } });

    return res.status(200).json({ status: 'success', message: 'OTP verified successfully' });
  },

  async resendOtp (req, res) {
    const { email } = req.body;
    const user = await User.find({ email });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `otp_${email}`;

    const otp = generateOTP();
    const expirationTimeInSeconds = 300;

    await redisClient.set(key, otp, expirationTimeInSeconds);

    sendOtpEmail(email, `${user.firstName} ${user.lastName}`, otp);

    return res.status(200).json({ status: 'success', message: 'OTP resent' });
  }

};

module.exports = UsersController;
