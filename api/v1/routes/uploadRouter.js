const express = require("express");
const router = express.Router()
const { ensureAuth, ensureAdmin } = require('../middlewares/auth')
const { uploadImages, deleteImages } = require("../controllers/uploadCtrl");
const { uploadPhoto, productImgResize } = require("../middlewares/upload_image");

router.post(
  "/",
  ensureAuth,
  ensureAdmin,
  uploadPhoto.array("images", 2), // means i want to upload 2 photo
  productImgResize,
  uploadImages
);

router.delete("/deleteimage/:id", ensureAuth, ensureAdmin, deleteImages);

module.exports = router