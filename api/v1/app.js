const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const passport = require('passport');
const authRouter = require('./routes/authRouter')
const productRouter = require('./routes/productRouter')
const categoryRouter = require('./routes/categoryRouter')
const couponRouter = require('./routes/couponRouter')
const addressRouter = require('./routes/addressRouter')
const cartRouter = require('./routes/cartRouter')
const orderRouter = require('./routes/orderRouter')
const uploadRouter = require('./routes/uploadRouter')
const enquiryRouter = require('./routes/enquiryRouter')
const dbConnect = require("./config/db");


const app = express();

// Load config. always make sure you load it first
dotenv.config({ path: './config/config.env' });

// Passport config
require('./config/passport')(passport);
require('./utils/email');



dbConnect();
// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Sessions
app.use(
  session({
    name: 'chinenye',
    secret: 'keyboard word',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60000 * 60 * 24
  },
    // creates session in the database with cookie
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// route handlers
app.use('/api/user', authRouter);
app.use('/api/product', productRouter)
app.use('/api/category', categoryRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/address', addressRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/image', uploadRouter)
app.use('/api/enquiry', enquiryRouter)


// Logging using morgan middleware only if we are in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


// path to our static folders
app.use(express.static(path.join(__dirname, 'public')));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
