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
    getCreate,
    deleteProduct} = require('../controllers/productCtrl');
const { ensureAuth, ensureGuest,  ensureAdmin, validateId, validateQuery } = require('../middlewares/auth')
router.post('/', ensureAuth, ensureAdmin, createProduct)
router.get('/getcreate', ensureAuth, ensureAdmin, getCreate)
router.get('/:id', validateId, getProduct)
router.get('/', validateQuery, getAllProduct)
router.put('/editproduct/:id', ensureAuth, ensureAdmin, validateId, updateProduct)
router.delete('/:id', ensureAuth, ensureAdmin, validateId, deleteProduct)
router.post("/rating/:id", ensureAuth, productRating)
router.post("/discountproduct/:id", validateId, ensureAuth, ensureAdmin, applyDiscount);
router.post("/discountallproducts/", ensureAuth, ensureAdmin, applyAllDiscount);
router.put("/removealldiscount", ensureAuth, ensureAdmin, removeAllDiscount);
router.put("/removediscount/:id", validateId, ensureAuth, ensureAdmin, removeProductDiscount);

module.exports = router