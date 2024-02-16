const express = require('express')
const router = express.Router()
const { createCategory,
    updateCategory,
    deleteCategory,
    getCategory,
    getAllCategory

} =  require("../controllers/categoryCtrl");

const { ensureAuth,
    ensureGuest,
    ensureAdmin,
    validateId,
  validateLogin} = require('../middlewares/auth')

router.post('/', ensureAuth, ensureAdmin, createCategory)
router.put('/:id', validateId, ensureAuth, ensureAdmin, updateCategory)
router.delete('/:id', validateId, ensureAuth, ensureAdmin, deleteCategory)
router.get("/:id", getCategory);
router.get("/", getAllCategory);

module.exports = router