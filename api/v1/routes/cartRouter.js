const express = require("express");
const router = express.Router();
const { ensureAuth, ensureAdmin, validateId } = require('../middlewares/auth')
const { createCart, increaseQuantity, decreaseQuantity,  getCart,deleteItem, applyCoupon, emptyCart } = require("../controllers/cartCtrl"); // Make sure to import emptyCart

router.get('/getcart', ensureAuth, getCart)
router.get("/emptycart", ensureAuth, emptyCart); 
router.get('/:id', ensureAuth, createCart)
router.get('/decrease/:id', validateId, ensureAuth, decreaseQuantity)
router.get('/increase/:id', validateId, ensureAuth, increaseQuantity)
router.get('/deleteitem/:id', validateId, ensureAuth, deleteItem)
router.post('/applycoupon', ensureAuth, applyCoupon)


module.exports = router;
