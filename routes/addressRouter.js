const express = require('express')
const router = express.Router()
const { addAddress,
    getAddress
} =  require("../controllers/addressCtrl");

const { ensureAuth,
    ensureGuest,
    ensureAdmin,
    validateId,} = require('../middlewares/auth')

router.post('/', ensureAuth, addAddress)
router.get('/getaddress', ensureAuth, getAddress)

module.exports = router;