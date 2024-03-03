const express = require("express");
const passport = require('passport')
const router = express.Router()
const { createUser,
  signUp,
  signIn,
  getForgotPassword,
  wishList,
  getWishList,
  getAllUsers,
  getMyUser,
  getUser,
  deleteUser,
  updateUser,
  logOut,
  verifyToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  blockUser,
  unBlockUser,
} =  require("../controllers/userCtrl");

const { ensureAuth,
  ensureGuest,
  ensureAdmin,
  validateId,
} = require('../middlewares/auth')


router.post("/register", ensureGuest, createUser);
router.get("/:id/verify/:token/", validateId, verifyToken);
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/api/user/login',
    failureFlash: true
  })(req, res, next);
});
router.get('/googlelogin', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/user/register',
    failureFlash: true
   }),
  (req, res) => {
    res.redirect('/')
  }
)
router.get('/', ensureGuest, signUp);
router.get('/login', ensureGuest, signIn )
router.get('/forgotpassword', ensureGuest, getForgotPassword )
router.get("/allusers", ensureAuth, ensureAdmin, getAllUsers);
router.post('/forgotpassword', ensureGuest, forgotPassword)
router.get("/:id/resetpassword/:token", ensureGuest, validateId, resetPassword);
router.post("/:id/resetpassword/:token", ensureGuest, validateId, updatePassword);
router.get('/logout', ensureAuth, logOut)
router.get('/myuser', ensureAuth, getMyUser)
router.get("/wishlist/:id", ensureAuth, wishList)
router.get("/getwishlist", ensureAuth, getWishList)
router.get("/:id", validateId, ensureAdmin, getUser);
router.get("/delete/:id", validateId, deleteUser);
router.post('/update', ensureAuth, updateUser)
router.get('/blockuser/:id', ensureAuth, ensureAdmin, blockUser)
router.get('/unblockuser/:id', ensureAuth, ensureAdmin, unBlockUser)




module.exports = router