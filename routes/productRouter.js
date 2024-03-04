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
    getUpdate,
    getDiscount,
    deleteProduct} = require('../controllers/productCtrl');
const { ensureAuth, ensureGuest,  ensureAdmin, validateId, validateQuery } = require('../middlewares/auth')
router.post('/', ensureAuth, ensureAdmin, createProduct)
router.get('/getcreate', ensureAuth, ensureAdmin, getCreate)
router.get('/getupdate/:id', ensureAuth, ensureAdmin, getUpdate)
router.get('/getdiscount/:id', ensureAuth, ensureAdmin, getDiscount)
router.get('/', validateQuery, getAllProduct)
router.get("/removealldiscount", ensureAuth, ensureAdmin, removeAllDiscount);
router.get('/:id', validateId, getProduct)
router.post('/update/:id', ensureAuth, ensureAdmin, validateId, updateProduct)
router.get('/delete/:id', ensureAuth, ensureAdmin, validateId, deleteProduct)
router.post("/rating/:id", ensureAuth, productRating)
router.post("/discountproduct/:id", validateId, ensureAuth, ensureAdmin, applyDiscount);
router.post("/discountallproducts/", ensureAuth, ensureAdmin, applyAllDiscount);
router.get("/removediscount/:id", validateId, ensureAuth, ensureAdmin, removeProductDiscount);

module.exports = router