const express = require('express');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const Handlebars = require('handlebars');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('express-flash');
const authRouter = require('./routes/authRouter')
const productRouter = require('./routes/productRouter')
const categoryRouter = require('./routes/categoryRouter')
const couponRouter = require('./routes/couponRouter')
const addressRouter = require('./routes/addressRouter')
const cartRouter = require('./routes/cartRouter')
const orderRouter = require('./routes/orderRouter')
const uploadRouter = require('./routes/uploadRouter')
const enquiryRouter = require('./routes/enquiryRouter')
const typeRouter = require('./routes/productTypeRouter')
const homeRouter = require('./routes/homeRouter')
const dbConnect = require("./config/db");


const app = express();

// Load config. always make sure you load it first
dotenv.config({ path: './config/config.env' });


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs');
app.use(flash());
app.engine(
  '.hbs',
  exphbs.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main', // main.hbs is like our base.html
    extname: '.hbs',// we don't want to use a longname handlebars so we shortened it to hbs
  })
);
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

// path to our static folders
app.use(express.static(path.join(__dirname, 'public')));
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
app.use('/api/type', typeRouter)
app.use('/', homeRouter)


// Logging using morgan middleware only if we are in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
