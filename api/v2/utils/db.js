const mongoose = require('mongoose');

class DBClient {
  constructor () {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'c_c_estore';

    const uri = `mongodb://${host}:${port}/${database}`;

    mongoose.connect(uri);

    this.connection = mongoose.connection;

    this.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    this.connection.once('open', () => {
      console.log('Connected to MongoDB');
    });
  }

  isAlive () {
    return this.connection.readyState === 1;
  }

  async nbUsers () {
    return mongoose.model('User').countDocuments();
  }

  async nbProducts () {
    return mongoose.model('Product').countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
