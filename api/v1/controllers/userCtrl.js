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
    const find_google_user = await User.findOne({ "google.email": email });

    if (findUser) {
      return res.status(400).json({ "message": "User already exists!" });
    } else if(find_google_user){
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
      res.status(200).json({
        message: "User created",
        data: updateLocalUser
      })
      console.log('Google user updated with Local info');
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

      return res.status(201).send({ 
        message: "An email has been sent to your account. Please verify your email address." 
      });
    }
  } catch (err) {
    console.error(err);

    if (err.name === 'ValidationError' && err.errors) {
      const validationErrors = Object.values(err.errors).map((error) => error.message);
      return res.status(400).json({
        "message": "Validation failed",
        "validationErrors": validationErrors
      });
    }

    return res.status(500).json({
      "message": "Internal server error"
    });
  }
};

// verify token
const verifyToken = async (req, res) => {
  const { id, token } = req.params;
  console.log(token)

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).send({ message: "No user found with this id" });
    }

    const userToken = await Token.findOne({
      userId: user._id,
      token: token,
    });
    if (!userToken) {
      return res.status(400).send({ message: "Invalid token" });
    }
    // Token is valid, update the user and delete the token
    await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    await Token.findByIdAndDelete(userToken._id);
    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message
    });
  }
};

// login success function
const successRoute = (req, res) => {
  // Access user information from req.user
  const user = req.user;

  try {
    if (!user) {
      // Handle the case where user information is not available
      return res.status(401).json({ message: 'User not authenticated' });
    }else{
      return res.json({ message: 'Authentication successful', user: user });
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: error.message 
    });
  }
};

// login fail function
const failed = (req, res) => {
  res.status(400).json({ 
    message: 'Login failed' 
  });
};

// request password reset
const forgotPassword = async (req, res) => {
  const email = req.body.email;
  if(!email){
    return res.status(400).json({
      message: "Provide your email address"
    })
  }
  try {
    const user = await User.findOne({ "local.email": email });

    if (!user) {
      return res.status(400).json({ message: "No user found with this email" });
    }

    if (user.isPasswordModified === true) {
      await User.findByIdAndUpdate(
        user._id,
        { isPasswordModified: false },
        { new: true }
      );
    }

    if (user.isVerified === false) {
      return res.status(400).json({
        message: "An Email was sent to your account. Verify your account to login",
      });
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

      return res.status(201).json({
        message: "An email has been sent to your account. Click on it to reset your password.",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message:err.message,
    });
  }
};

// reset password
const resetPassword = async (req, res) => {
  const { id, token } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).send({ message: "No user found with this id" });
    }

    const userToken = await passwordResetToken.findOne({
      userId: user._id,
      token: token,
    });

    if (!userToken) {
      return res.status(400).send({ message: "Token is Invalid" });
    }

    // Token is valid, update the user and delete the token
    await User.findByIdAndUpdate(
      id,
      { isPasswordModified: true },
      { new: true }
    );

    // The TTL index will automatically remove expired tokens
    await passwordResetToken.findByIdAndDelete(userToken._id);
    res.status(200).send({ message: "You are a verified user. You can update your password now" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: error.message
    });
  }
};


const updatePassword = async (req, res) => {
  const { id, token } = req.params;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmNewPassword;

  try {
    // Check if the user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(400).send({ message: "No user found with this id" });
    }

    // Check if the password has already been modified
    if (!user.isPasswordModified) {
      const existingToken = await passwordResetToken.findOne({ userId: user._id });

      if (existingToken) {
        // Re-send the existing token
        return res.status(400).json({
          message: "Check your mail for a password reset token",
        });
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

      return res.status(201).json({
        message: "An email has been sent to your account. Click on it to reset your password.",
      });
    }else{
       // Validate and compare passwords
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
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

    return res.status(200).json({
      message: "Password reset successful",
      data: updatedUser,
    });
    }
   
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to reset password. Please try again later.",
      message: err.message
    });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  try {
    const getUsers = await User.find({});

    res.status(200).json({
      message: 'success',
      data: getUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
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
    return res.status(500).json({
      message: error.message,
    });
  }
};

// delete user function
const deleteUser = async(req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    return res.status(200).json({
      message: 'success',
      message: 'User deleted'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
    });
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
      return res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

const logOut = (req, res) => {
  try {
    console.log('logging out', req.user ? req.user._id : 'No user');
    req.logout(function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          message: err.message,
        });
      }
      res.status(200).json({
        message: "User logged out successfully"
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err.message,
    });
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
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.status(200).json({
      message: 'User blocked',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

const unBlockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    return res.status(200).json({
      message: 'User unblocked',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// add product to wishlist
const wishList = async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  
  try {
    const user = await User.findById(_id);
    if(user){
      const added = user.wishlist.find((id) => id.toString() === prodId.toString());
      if (added) {
        let user = await User.findByIdAndUpdate(
          _id,
          {
            $pull: { wishlist: prodId.toString() },
          },
          {
            new: true,
          }
        );
        res.json({
          message: 'product removed successfully',
          data: user
        });
      } else {
        let updated_user = await User.findByIdAndUpdate(
          _id,
          {
            $push: { wishlist: prodId },
          },
          {
            new: true,
          }
        );
        await updated_user.populate([
          { path: 'wishlist', select: 'name  description price discountedPrice images.url' },
        ]);
        res.json({
          message: "product added to wishlist successfully",
          data: updated_user.wishlist
        });
      }   
    }else{
      return res.status(404).json({
        message: 'User not found',
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

// get user wishlist
const getWishList = async(req, res) => {
  const { _id } = req.user
  try{
    const findUser = await User.findById(_id)
    if(!findUser){
      return res.status(404).json({
        message: "User not found"
      })
    }
    const wish = await findUser.populate([
      { path: 'wishlist', select: 'name  description price discountedPrice images.url' },
    ])
    res.json({
      message: "wishlist retrieved successfully",
      data: wish.wishlist
    });
  }catch(err) {
    console.log(err);
    return res.status(500).json({
      message: err.message,
    });
  }
}

// Export the createUser function
module.exports = {
  createUser, 
  successRoute,
  failed, getAllUsers,
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
