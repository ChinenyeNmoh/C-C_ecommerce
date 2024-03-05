const User = require('../models/user');
const Token = require("../models/token");
const passwordResetToken = require("../models/password_reset");
const crypto = require("crypto");
const { sendEmail, emailVerificationTemplate, passwordResetTemplate } = require('../utils/email');
const bcrypt = require('bcrypt');


// CREATE NEW USER
const createUser = async (req, res) => {
  try {
    const email = req.body.email;
    const findUser = await User.findOne({ "local.email": email });
    console.log(findUser)
    const findPhoneNo = await User.findOne({ "local.mobile": req.body.mobile });
    const find_google_user = await User.findOne({ "google.email": email });
    if (findUser) {
      req.flash('error', 'User already exist')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);

    } else if(findPhoneNo) {
       req.flash('error', "Phone number already exists!")
       const previousUrl = req.headers.referer || '/';
       res.redirect(previousUrl);
    }else if(find_google_user){
      const salt = await bcrypt.genSalt(10);
      const hashPassword1 = await bcrypt.hash(req.body.password, salt);
      const hashPassword2 = await bcrypt.hash(req.body.confirm_password, salt);
      const updateLocalUser = await User.findOneAndUpdate(
        { "google.email": email },
        {
          $set: {
            "local.firstname": req.body.firstname,
            "local.lastname": req.body.lastname,
            "local.email": email,
            "local.mobile": req.body.mobile,
            "local.password": hashPassword1,
            "local.confirm_password": hashPassword2,
            "address": req.body.address,
            isVerified: true
          },
        },
        { new: true }
      );
      req.flash('success', 'User created successfully')
      console.log('Google user updated with Local info');
      res.redirect('user/login')
    }else {
      const user = {
        "local.firstname": req.body.firstname,
        "local.lastname": req.body.lastname,
        "local.email": email,
        "local.mobile": req.body.mobile,
        "local.password": req.body.password,
        "local.confirm_password": req.body.confirm_password,
        "address": req.body.address,
      }
      const newUser = await User.create(user);
      // Generate a token
      const token = await new Token({
        userId: newUser._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save()

      // Construct the verification URL
      const link = `${process.env.BASE_URL}/${newUser.id}/verify/${token.token}`;
      const htmlContent = emailVerificationTemplate(link);

      // Send the verification email
      await sendEmail(newUser.local.email, 'Account verification',htmlContent);

      req.flash('success', "An email has been sent to your account. Verify your email address to login.")
      res.redirect('/')
   
    }
  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
};

// verify token
const verifyToken = async (req, res) => {
  const { id, token } = req.params;
  console.log(token)

  try {
    const user = await User.findById(id);

    if (!user) {
      req.flash('error', 'User not found')
      res.redirect('/api/user/')
    }

    const userToken = await Token.findOne({
      userId: user._id,
      token: token,
    });
    if (!userToken) {
      req.flash('error', 'invalid token')
      res.redirect('/api/user/')
    }
    // Token is valid, update the user and delete the token
    await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    await Token.findByIdAndDelete(userToken._id);
   req.flash('success', 'Email verified. You can log in')
   res.redirect('/api/user/login')
  } catch (err) {
    req.flash('error', err.message);
  }
};


// get register page
const signUp = (req, res) => {
    res.render('user/signup', {
       layout: 'main', 
       title: 'User', 
       isAuthenticated: req.user, 
       admin: req.user?.role, });
};
// get login page
const signIn = (req, res) => {
  let admin = false;
  if (req.user && req.user.role === 'admin') {
    admin = true;
} 
console.log(admin)
  res.render('user/login', { 
    layout: 'main', 
    title: 'User', 
    isAuthenticated: req.user, 
    admin, 
  });
};

const getForgotPassword = (req, res) => {
  let admin = false;
  if (req.user && req.user.role === 'admin') {
    admin = true;
} 
console.log(admin)
  res.render('user/forgot_password', { 
    layout: 'main', 
    title: 'User', 
    isAuthenticated: req.user, 
    admin
   });
};

// request password reset
const forgotPassword = async (req, res) => {
  const email = req.body.email;
  if(!email){
    req.flash('error', "Provide your email address")
  }
  try {
    const user = await User.findOne({ "local.email": email });

    if (!user) {
      req.flash('error', "No User found with this email address")
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }

    if (user.isPasswordModified === true) {
      await User.findByIdAndUpdate(
        user._id,
        { isPasswordModified: false },
        { new: true }
      );
    }

    if (user.isVerified === false) {
      req.flash('error', "Check your email for verification link")
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);

    } else {
      // Generate a token
      const token = await new passwordResetToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      // Construct the verification URL
      const link = `${process.env.BASE_URL}/${user.id}/resetpassword/${token.token}`;
      const htmlContent = passwordResetTemplate(link, user)

      // Send the verification email
      await sendEmail(user.local.email, 'Reset Password', htmlContent);
      req.flash('success', "An email has been sent to your account. Click on it to reset your password.")
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
  } catch (err) {
    req.flash('error', err.message);
  }
};

// reset password
const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  console

  try {
    const user = await User.findById(id);

    if (!user) {
      req.flash('error', 'No User Found')
    }

    const userToken = await passwordResetToken.findOne({
      userId: user._id,
      token: token,
    });

    if (!userToken) {
      req.flash('error', 'Invalid Token')
    }

    // Token is valid, update the user and delete the token
    await User.findByIdAndUpdate(
      id,
      { isPasswordModified: true },
      { new: true }
    );

    // The TTL index will automatically remove expired tokens
   // await passwordResetToken.findByIdAndDelete(userToken._id);
    req.flash('success', "You are a verified User. Update your account now")
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    res.render('user/reset_password', {
      layout: 'main', 
      title: 'Reset Password', 
      id, 
      token, 
      isAuthenticated: req.user, 
      admin
    })
  } catch (err) {
    req.flash('error', err.message);
  }
};


const updatePassword = async (req, res) => {
  const id = req.params.id;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmNewPassword;
  try {
    // Check if the user exists
    const user = await User.findById(id);
    console.log(user)
    if (!user) {
      req.flash('error', 'User not found')
      return res.redirect('/api/user/register');
    }

    // Check if the password has already been modified
    if (!user.isPasswordModified) {
      const existingToken = await passwordResetToken.findOne({ userId: user._id });
      console.log(existingToken)

      if (existingToken) {
        // Re-send the existing token
        res.flash('error', "Check your email for a reset link")
        return res.redirect('/api/user/register');
      }

      //if the password reset token has expired, generate a new token
      const newToken = await new passwordResetToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();

      // Construct the verification URL
      const link = `${process.env.BASE_URL}/${user.id}/resetpassword/${newToken.token}`;
      const htmlContent = passwordResetTemplate(link, user);

      // Send the verification email
      await sendEmail(user.local.email, 'Reset Password', htmlContent);
      req.flash('error', 'Check your mail for password reset token')
      return res.redirect('/api/user/login')
    }else{
       // Validate and compare passwords
    if (newPassword !== confirmPassword) {
      req.flash('error', 'Password do not match')
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }

    // Hash the passwords
    const salt = await bcrypt.genSalt(10);
    const hashPassword1 = await bcrypt.hash(newPassword, salt);
    const hashPassword2 = await bcrypt.hash(confirmPassword, salt);

    // Update the password
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { "local.password": hashPassword1, "local.confirm_password": hashPassword2 },
      { new: true }
    );

    req.flash('success', "password updated.")
    return res.redirect('/api/user/login')
    }
   
  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    const counter = await User.countDocuments();
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    return res.render('admin/all_users.hbs', { 
      layout: 'main', 
      users, 
      isAuthenticated: req.user, 
      admin, 
      title: 'All users', 
      counter,
    });
  } catch (error) {
    req.flash('error', error.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};


// get a user function
const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({
        message: 'User not found',
      });
    }else{
      return res.status(200).json({
        message: 'success',
        data: user,
      });
    }
    } catch (error) {
    console.error(error);
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

// get a user function
const getMyUser = async (req, res) => {
  const id = req.user._id;
  console.log(id)
  try {
    const user = await User.findById(id);
    const googleuser = user.google
    if(!user){
      return res.status(404).json({
        message: 'User not found',
      });
    }else{
      let admin = false;
      if (req.user && req.user.role === 'admin') {
        admin = true;
    } 
    console.log(admin)
      res.render('user/account', {
        layout: 'main', 
        title: "My Account", 
        user,
        googleuser,
        isAuthenticated: req.user,
         admin
        })
    }
    } catch (error) {
    console.error(err);
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

// delete user function
const deleteUser = async(req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      req.flash('error', "User not found");
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
    }
    req.flash('success', "User deleted");
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  } catch (err) {
    console.log(err)
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

// update user function

const updateUser = async (req, res) => {
  const id = req.user.id;

  try {
    const newUser = {
      "local.firstname": req.body.firstname ? req.body.firstname : req.user.local.firstname,
      "local.lastname": req.body.lastname ? req.body.lastname : req.user.local.lastname,
      "address": req.body.address ? req.body.address : req.user.address
    };
    
    const user = await User.findByIdAndUpdate(
      id,
     newUser,
      { new: true, runValidators: true }
    );

    if (user) {
      req.flash('success', 'Information updated')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    } else {
      req.flash('error', 'User not found')
      const previousUrl = req.headers.referer || '/';
      res.redirect(previousUrl);
    }
  } catch (error) {
    req.flash('error', err.message);
  }
};

const logOut = (req, res) => {
  try {
    req.logout(function(err) {
      if (err) {
        console.error(err);
        req.flash('error', err.message)
        const previousUrl = req.headers.referer || '/';
        res.redirect(previousUrl);
      }
      req.flash('success', "User logged out")
      res.redirect('/');
    });
  } catch (err) {
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    res.redirect(previousUrl);
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true, runValidators: true }
    );

    if (!user) {
      req.flash('error', "User not found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }

    req.flash('success', "User is blocked");
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  } catch (error) {
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

const unBlockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true, runValidators: true }
    );
    if (!user) {
      req.flash('error', "User not found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    req.flash('success', "User Unblocked");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
  } catch (error) {
    console.error(error);
    req.flash('error', err.message);
    const previousUrl = req.headers.referer || '/';
    return res.redirect(previousUrl);
  }
};

const wishList = async (req, res) => {
  const { _id } = req.user;
  const prodId = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/');
    }

    const added = user.wishlist.find((id) => id.toString() === prodId.toString());
    if (added) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId.toString() } },
        { new: true }
      );
      req.flash('success', 'Product removed successfully');
      console.log(user.wishlist.length);

      if (user.wishlist.length === 1) {
        console.log('Redirecting to /api/product/');
        return res.redirect('/api/product/');
      }else{
        const previousUrl = req.headers.referer || '/';
      console.log('Redirecting to previous URL:', previousUrl);
      return res.redirect(previousUrl);
      }
      
    } else {
      let updated_user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
      await updated_user.populate([
        { path: 'wishlist', select: 'name description price discountedPrice images.url' },
      ]);
      req.flash('success', 'Product added to wishlist');
      const previousUrl = req.headers.referer || '/';
      console.log('Redirecting to previous URL:', previousUrl);
      return res.redirect(previousUrl);
    }
  } catch (err) {
    console.error(err);
    req.flash('error', err.message);
    res.render('error', { layout: 'main', err, title: 'User' });
  }
};


// get user wishlist
const getWishList = async(req, res) => {
  const { _id } = req.user
  try{
    const findUser = await User.findById(_id)
    if(!findUser){
      req.flash('error', "User not found");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    const wish = await findUser.populate([
      { path: 'wishlist' },
    ])
    const product = wish.wishlist
    console.log(product)
    if(!product.length){
      req.flash('error', "WishList is empty");
      const previousUrl = req.headers.referer || '/';
      return res.redirect(previousUrl);
    }
    let admin = false;
    if (req.user && req.user.role === 'admin') {
      admin = true;
  } 
  console.log(admin)
    return res.render('shop/show_wishlist', {
       layout: 'main', 
       title: "products", 
       product, 
       isAuthenticated: req.user, 
       admin
      })

  }catch(err) {
    req.flash('error', err.message);
    res.render('error', { layout: 'main', err, title: 'User' });
  }
}

// Export the createUser function
module.exports = {
  createUser, 
  signUp,
  signIn,
  getForgotPassword,
  getAllUsers,
  getMyUser,
  verifyToken,
  wishList,
  getWishList,
  updatePassword,
  resetPassword,
  forgotPassword,
  getUser,
  deleteUser,
  updateUser,
  logOut,
  blockUser,
  unBlockUser,
};
