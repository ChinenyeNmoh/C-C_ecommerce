const express = require('express')
const router = express.Router()
const { createCoupon,
    updateCoupon,
    deleteCoupon,
    getCoupon,
    getAllCoupon,
    getCreate

} =  require("../controllers/couponCtrl");

const { ensureAuth,
    ensureGuest,
    ensureAdmin,
    validateId,
  validateLogin} = require('../middlewares/auth')

router.post('/', ensureAuth, ensureAdmin, createCoupon)
router.get("/getall", ensureAdmin, getAllCoupon);
router.get('/getcreate', ensureAuth, ensureAdmin, getCreate)
router.put('/:id', validateId, ensureAuth, ensureAdmin, updateCoupon)
router.get('/delete/:id', validateId, ensureAuth, ensureAdmin, deleteCoupon)
router.get("/:id", ensureAdmin, getCoupon);


module.exports = router