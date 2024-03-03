const express = require("express");
const router = express.Router();
const { ensureAuth, ensureAdmin, validateId } = require('../middlewares/auth')
const {
    checkOut, 
    getMyOrder,
    getUserOrder,
    getAllOrders,
    deleteOrder,
    confirmDelivery,
    getPendingOrders,
    getDeliveredOrders
} = require("../controllers/orderCtrl"); 

router.post('/', ensureAuth, checkOut)
router.get('/getmyorder', ensureAuth, getMyOrder )
router.get('/getuserorder/:id', validateId, ensureAdmin, ensureAuth, getUserOrder )
router.get('/pendingorders', ensureAdmin, ensureAuth, getPendingOrders)
router.get('/deliveredorders', ensureAdmin, ensureAuth, getDeliveredOrders)
router.get('/getallorders', ensureAdmin, ensureAuth, getAllOrders)
router.get('/confirmdelivery/:id', validateId, ensureAdmin, ensureAuth, confirmDelivery)
router.get('/delete/:id', validateId, ensureAdmin, ensureAuth, deleteOrder)

module.exports = router;
