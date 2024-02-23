const express = require("express");
const router = express.Router();
const { ensureAuth, ensureAdmin, validateId } = require('../middlewares/auth')
const { createCart, increaseQuantity, decreaseQuantity,  getCart,deleteItem, applyCoupon, emptyCart } = require("../controllers/cartCtrl"); // Make sure to import emptyCart


router.post('/createcart', ensureAuth, createCart)
router.get('/getcart', ensureAuth, getCart)
router.get('/decrease/:id', validateId, ensureAuth, decreaseQuantity)
router.get('/increase/:id', validateId, ensureAuth, increaseQuantity)
router.delete('/deleteproduct/:id', validateId, ensureAuth, deleteItem)
router.delete("/deletecart", ensureAuth, emptyCart); 
router.post('/applycoupon', ensureAuth, applyCoupon)


module.exports = router;
