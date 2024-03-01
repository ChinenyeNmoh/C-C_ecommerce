const express = require('express')
const router = express.Router()
const { createEnquiry,
    updateEnquiry,
    deleteEnquiry,
    getEnquiry,
    getAllEnquiry

} =  require("../controllers/enquiryCtrl");

const { ensureAuth,
    ensureGuest,
    ensureAdmin,
    validateId,
  validateLogin} = require('../middlewares/auth')

router.post('/', ensureAuth, createEnquiry)
router.put('/:id', validateId, ensureAuth,  updateEnquiry)
router.delete('/:id', validateId, ensureAuth, ensureAdmin, deleteEnquiry)
router.get("/:id", ensureAdmin, getEnquiry);
router.get("/", ensureAdmin, getAllEnquiry);

module.exports = router