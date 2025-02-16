const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { uploadImage } = require("../config/cloudinaryhelpers");

const userController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    // Validate user credentials
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Send token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.status(200).json({ message: "Login successful" });
  },

  updatepfp: async (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "No file uploaded or invalid file type" });
      }

      // Upload the image to Cloudinary using the uploadImage function
      const imageUrl = await uploadImage(req.file.path);

      // Update the user's profile picture in the database
      const userId = req.user.id;
      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: imageUrl }, // Update the profilePicture field
        { new: true } // Return the updated user
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the updated user with the new profile picture URL
      res
        .status(200)
        .json({ message: "Profile picture updated successfully", user });
    } catch (error) {
      console.error("Error updating profile picture:", error);

      // Delete the temporary file if an error occurs (only if uploadImage didn't handle it)
      if (req.file && !error.handledByUploadImage) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        message: "Error updating profile picture",
        error: error.message,
      });
    }
  },
  updateprofile: async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body; // Get the validated update data from the request body

      // Update only the fields provided in the request body using $set
      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updateData }, // Use $set to update only the specified fields
        {
          new: true, // Return the updated user
          runValidators: true, // Run schema validators on the updated data
          context: "query", // Ensures validators like `unique` work correctly
        }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return the updated user
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user:", error);

      // Handle validation errors
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ message: "Validation failed", errors: error.errors });
      }

      res
        .status(500)
        .json({ message: "Error updating user", error: error.message });
    }
  },
};

module.exports = userController;