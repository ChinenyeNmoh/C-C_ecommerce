function generateOTP () {
  const length = 6;
  const chars = '0123456789';
  let otp = '';

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    otp += chars[index];
  }

  return otp;
}

module.exports = generateOTP;
