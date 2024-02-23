const mongoose = require('mongoose')
const dbConnect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        //these optional arguments will help prevent errors in the console
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
  
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  }
  
  module.exports = dbConnect