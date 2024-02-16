const express = require("express");
const router = express.Router()
const {createProduct,
    getProduct,
    getAllProduct,
    applyDiscount,
    applyAllDiscount,
    updateProduct,
    productRating,
    removeAllDiscount,
    removeProductDiscount,
    deleteProduct} = require('../controllers/productCtrl');
const { ensureAuth, ensureGuest,  ensureAdmin, validateId } = require('../middlewares/auth')
router.post('/', ensureAuth, ensureAdmin, createProduct)
router.get('/:id', validateId, getProduct)
router.get('/',  getAllProduct)
router.put('/editproduct/:id', ensureAuth, ensureAdmin, validateId, updateProduct)
router.delete('/:id', ensureAuth, ensureAdmin, validateId, deleteProduct)
router.put("/rating", ensureAuth, productRating)
router.post("/discountproduct/:id", validateId, ensureAuth, ensureAdmin, applyDiscount);
router.post("/discountallproducts/", ensureAuth, ensureAdmin, applyAllDiscount);
router.put("/removealldiscount", ensureAuth, ensureAdmin, removeAllDiscount);
router.put("/removediscount/:id", validateId, ensureAuth, ensureAdmin, removeProductDiscount);

module.exports = router