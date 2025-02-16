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
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Image deleted successfully from cloudinary");
  } catch (error) {
    console.error("cloudinary Deletion Error:", error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };
