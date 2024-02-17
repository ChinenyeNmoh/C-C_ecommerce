const express = require("express");
const passport = require('passport')
const router = express.Router()
const { createUser,
  successRoute,
  failed,
  wishList,
  getWishList,
  getAllUsers,
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
validateLogin} = require('../middlewares/auth')


router.post("/register", ensureGuest, createUser);
router.get("/register", ensureGuest, createUser);
router.get("/:id/verify/:token/", validateId, verifyToken);
router.post('/login', validateLogin, (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/api/user/success',
    failureRedirect: '/api/user/failurejson',
    failureFlash: false
  })(req, res, next);
});
router.get('/googlelogin', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/user/failurejson' }),
  (req, res) => {
    res.redirect('/api/user/success')
  }
)
router.get('/failurejson', failed);
router.get("/allusers", ensureAuth, ensureAdmin, getAllUsers);
router.get('/success', ensureAuth, successRoute);
router.post('/forgotpassword', ensureGuest, forgotPassword)
router.get("/:id/resetpassword/:token/", ensureGuest, validateId, resetPassword);
router.put("/:id/resetpassword/:token/", ensureGuest, validateId, updatePassword);
router.get('/logout', ensureAuth, logOut)
router.put("/wishlist", ensureAuth, wishList)
router.get("/getwishlist", ensureAuth, getWishList)
router.get("/:id", validateId, ensureAdmin, getUser);
router.delete("/:id", validateId, deleteUser);
router.put('/edituser', ensureAuth, updateUser)
router.put('/blockuser/:id', ensureAuth, ensureAdmin, blockUser)
router.put('/unblockuser/:id', ensureAuth, ensureAdmin, unBlockUser)




module.exports = router