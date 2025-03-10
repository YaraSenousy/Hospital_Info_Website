const { User } = require("../models/User.model");
const jwt = require("jsonwebtoken");
const { uploadImage, deleteImage } = require("../config/cloudinaryhelpers");
const bcrypt = require("bcryptjs");

const userController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Validate user credentials
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare entered password with stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      // // Send token in HTTP-only cookie
      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      //   maxAge: 15 * 60 * 1000, // 15 minutes,
      // });

      // Production cookie settings (recommended)
      // res.cookie("token", token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production" ? true : false, // Secure only in production
      //   sameSite: "none",
      //   maxAge: 15 * 60 * 1000,
      // });

      res.status(200).json({ message: "Login successful", accessToken: token });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
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
      const userId = req.user.userId;
      //first delete current url
      const currentUser = await User.findById(userId);
      if (currentUser && currentUser.image) {
        await deleteImage(currentUser.image);
      }
      //now update imageurl
      const user = await User.findByIdAndUpdate(
        userId,
        { image: imageUrl }, // Update the image field
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
      const userId = req.user.userId;
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

  getProfile: async (req, res) => {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const userId = req.user.userId;
    console.log("User ID:", userId); // Log the user ID
    const fieldsToReturn =
      "name birthDate email phoneNumber gender image role expertiseLevel";
    if (userId) {
      try {
        const user = await User.findById(userId).select(fieldsToReturn);
        console.log("user: ", user);
        res.json(user);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(404).json({ error: "Couldn't find the user" });
    }
  },

  removeUser: async (req, res) => {
    try {
      const { email } = req.body;
  
      // Validate email is provided
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
  
      const user = await User.findOneAndDelete({ email });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.sendStatus(204);
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

module.exports = userController;
