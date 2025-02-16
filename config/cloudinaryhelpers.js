
const cloudinary = require('./Cloudinary');
req
const fs = require('fs');

// Upload Image Function
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: process.env.CLOUDINARY_FOLDER // Store in a specific Cloudinary folder
    });

    // Remove the locally stored file after upload
    fs.unlinkSync(filePath);

    return result.secure_url; // Return the uploaded image URL
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

// Delete Image Function
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted successfully from Cloudinary');
  } catch (error) {
    console.error('Cloudinary Deletion Error:', error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };  
