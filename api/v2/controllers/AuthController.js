const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const User = require('../models/User');
const generateOTP = require('../utils/otp');
const sendOtpEmail = require('../utils/email');

const AuthController = {
  async getConnect (req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) return res.status(401).json({ error: 'Unauthorized' });

      const token = uuidv4();
      const key = `auth_${token}`;

      await redisClient.set(key, user._id.toString(), 86400);

      return res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getDisconnect (req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const key = `auth_${token}`;
      const userId = await redisClient.get(key);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await redisClient.del(key);

      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async forgotPassword (req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = generateOTP();
    const key = `reset_password_otp_${email}`;
    const expirationTimeInSeconds = 300;

    await redisClient.set(key, otp, expirationTimeInSeconds);
    sendOtpEmail(email, `${user.firstName} ${user.lastName}`, otp);

    return res.status(200).json({ status: 'success' });
  }

};

module.exports = AuthController;
