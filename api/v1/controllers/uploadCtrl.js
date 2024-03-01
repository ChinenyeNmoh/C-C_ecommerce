const {
    cloudinaryUploadImg,
    cloudinaryDeleteImg,
  } = require("../utils/cloudinary");
const fs = require("fs");

//upload image
const uploadImages = async (req, res) => {
  try {
    // Define a function 'uploader' that uses the 'cloudinaryUploadImg' function with a specified folder ("images")
    const uploader = (path) => cloudinaryUploadImg(path, "images");

    // Initialize an array to store Cloudinary URLs of the uploaded images
    const urls = [];

    // Retrieve the files from the request
    const files = req.files;

    // Loop through each file in the request
    for (const file of files) {
      // Extract the 'path' property from the file
      const { path } = file;
      console.log(path)
  

      // Upload the image to Cloudinary and get the Cloudinary URL
      const newpath = await uploader(path);
      // Add the Cloudinary URL to the 'urls' array
      urls.push(newpath);

      // Delete the temporarily stored file on the server after uploading to Cloudinary
      fs.unlink(path, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`File ${path} deleted successfully`);
        }
      });      
    }
    const images = urls.map((file) => file) 
    req.flash('success', 'Upload successful')
     // Redirect to the previous URL
     const previousUrl = req.headers.referer || '/';
     res.redirect(previousUrl);
  } catch (err) {
    console.log(err);
    req.flash('error', err.message)
  }
};

// get image 
const getImage = async (req, res) => {
  res.render('admin/upload', {
    layout: 'main',
    title: "Upload images",
    isAuthenticated: req.user,
    admin: req.user.role
  })
}
// delete images
const deleteImages = async (req, res) => {
  const { id } = req.params;
  try {
    await cloudinaryDeleteImg(id, "images");

    res.json({ message: "Image Deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = { uploadImages, deleteImages, getImage}
