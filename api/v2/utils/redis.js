const redis = require('redis');

class RedisClient {
  constructor () {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.error('Redis connection failed:', err);
    });
  }

  isAlive () {
    return this.client && this.client.connected;
  }

  async get (key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error, value) => {
        if (error) reject(error);
        resolve(value);
      });
    });
  }

  async set (key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (error) => {
        if (error) reject(error);
        resolve(true);
      });
    });
  }

  async del (key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (error, response) => {
        if (error) reject(error);
        resolve(response === 1);
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
