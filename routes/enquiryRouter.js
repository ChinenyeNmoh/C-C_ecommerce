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
  } = require('../middlewares/auth')

router.post('/', createEnquiry)
router.get("/getall", ensureAdmin, getAllEnquiry);
router.get('/update/:id', validateId, ensureAuth,  updateEnquiry)
router.get('/delete/:id', validateId, ensureAuth, ensureAdmin, deleteEnquiry)
router.get("/:id", ensureAdmin, getEnquiry);


module.exports = router