const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
sharp.cache(false);

//specify where you want to store the images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/products"));
  },
  // specify file name
  filename: function (req, file, cb) {
    const uniquesuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniquesuffix + ".jpeg");
  },
});

// file validation to accept any form of image extension whether jpeg or png
// if you want only jpeg or png then do
// if(file.mimetype === "image/jpeg" || file.mimetype === "image/png")
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
    storage: storage,
    fileFilter: multerFilter,
    limits: { fileSize: 1000000 },
  });

async function resizeFile(path) {
  let buffer = await sharp(path)
    .resize(800, 800)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
  
  // Overwrite the original file with the resized image
  await sharp(buffer).toFile(path);
}

const productImgResize = async (req, res, next) => {
  // Check if there are any files in the request
  if (!req.files) return next();

  try {
    // Use Promise.all to handle multiple files concurrently
    await Promise.all(
      req.files.map(async (file) => {
        // Resize the image and overwrite the original file
        await resizeFile(file.path);
      })
    );
  } catch (error) {
    console.error('Error resizing image:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  next();
};

module.exports =  { uploadPhoto, productImgResize };