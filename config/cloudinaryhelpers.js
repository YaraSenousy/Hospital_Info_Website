const cloudinary = require("./cloundinary");
const fs = require("fs");

// Upload Image Function
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: process.env.CLOUDINARY_FOLDER, // Store in a specific cloudinary folder
    });

    // Remove the locally stored file after upload
    fs.unlinkSync(filePath);

    return result.secure_url; // Return the uploaded image URL
  } catch (error) {
    console.error("cloudinary Upload Error:", error);
    throw error;
  }
};

// Delete Image Function
const deleteImage = async (imageUrl) => {
  try {
    // Extract the public ID from the URL
    // Format is typically: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[extension]
    if (!imageUrl) return;
    
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicIdParts = publicIdWithExtension.split('.');
    const folder = urlParts[urlParts.length - 2];
    
    // Combine folder and filename without extension to get the full public ID
    const publicId = `${process.env.CLOUDINARY_FOLDER}/${publicIdParts[0]}`;
    
    await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted successfully from cloudinary");
  } catch (error) {
    console.error("cloudinary Deletion Error:", error);
  }
};

module.exports = { uploadImage, deleteImage };
