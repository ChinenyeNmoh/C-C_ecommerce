const cloudinary = require('cloudinary');
const dotenv = require("dotenv")
dotenv.config({ path: './config/config.env' });
          
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

  const cloudinaryUploadImg = async (fileToUploads) => {
    return new Promise((resolve, reject) => {
      console.log('Uploading to Cloudinary:', fileToUploads);
  
      cloudinary.uploader.upload(fileToUploads, (result, error) => {
        if (error) {
          // If there is an error during the upload, reject the promise with the error
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else if (result && result.secure_url) {
          // If 'result' exists and has the 'secure_url' property, resolve the promise with the image information
          console.log('Cloudinary upload successful:', result.secure_url);
          resolve({
            url: result.secure_url,
            asset_id: result.asset_id,
            public_id: result.public_id,
          });
        } else {
          // If 'result' is undefined or does not have 'secure_url', reject the promise with an error message
          console.error('Invalid Cloudinary upload response:', result);
          reject(new Error('Invalid Cloudinary upload response'));
        }
      });
    });
  };
  
  
  const cloudinaryDeleteImg = async (fileToDelete) => {
    return new Promise((resolve) => {
      // Use the cloudinary.uploader.destroy method to delete the specified file from Cloudinary
      cloudinary.uploader.destroy(fileToDelete, (result) => {
        // Resolve the Promise with an object containing information about the deleted image
        resolve(
          {
            url: result.secure_url,    // URL of the deleted image
            asset_id: result.asset_id,  // Asset ID assigned by Cloudinary
            public_id: result.public_id,  // Public ID assigned by Cloudinary
          },
          {
            resource_type: "auto",  // Specify the resource type as "auto"
          }
        );
      });
    });
  };
  
  module.exports = { cloudinaryUploadImg, cloudinaryDeleteImg };
  