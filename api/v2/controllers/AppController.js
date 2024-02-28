const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const AppController = {
  async getStatus (req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();

    return res.status(200).json({ redis: redisStatus, db: dbStatus });
  },

  async getStats (req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbProducts = await dbClient.nbProducts();

    return res.status(200).json({ users: nbUsers, products: nbProducts });
  }
};

module.exports = AppController;
