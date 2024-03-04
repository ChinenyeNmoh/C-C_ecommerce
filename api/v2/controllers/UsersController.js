const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const User = require('../models/User');
const generateOTP = require('../utils/otp');
const sendOtpEmail = require('../utils/email');
const Address = require('../models/Address');

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

    return res.status(200).json({ user });
  },

  async addAddress (req, res) {
    try {
      const userId = req.user.id;

      const { firstName, lastName, mobile, address } = req.body;

      const newAddress = await Address.create({ firstName, lastName, mobile, address });

      const user = await User.findByIdAndUpdate(
        userId,
        { $push: { addresses: newAddress._id } },
        { new: true }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  async verifyOtp (req, res) {
    console.log(' in here now');
    const { email, otp } = req.body;
    const key = `otp_${email}`;

    const storedOtp = await redisClient.get(key);

    if (storedOtp !== String(otp)) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await redisClient.del(key);

    await User.updateOne({ email }, { $set: { isVerified: true } });

    return res.status(200).json({ status: 'success' });
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
  },

  async resetPassword (req, res) {
    const { email, password, otp } = req.body;

    const storedOtp = await redisClient.get(`reset_password_otp_${email}`);

    if (storedOtp !== String(otp)) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }

    await User.updateOne({ email }, { $set: { password } });

    await redisClient.del(`reset_password_otp_${email}`);

    return res.status(200).json({ status: 'success' });
  }

};

module.exports = UsersController;
