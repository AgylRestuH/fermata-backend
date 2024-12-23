const User = require("../models/userModel");
const upload = require("../middleware/uploadMiddleware");

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update profile function
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic user details
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update phone and address if the user is not an admin
    if (user.user_type.role !== "admin") {
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
    }

    // Update teacher data if the user is a teacher
    if (user.user_type.role === "teacher" && req.body.teacher_data) {
      user.user_type.teacher_data = {
        instruments:
          req.body.teacher_data.instruments ||
          user.user_type.teacher_data.instruments,
      };
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:8080"; // Default to localhost if not set

    // Handle cover image upload if provided
    if (req.file) {
      user.cover_image = req.file
        ? `${baseUrl}/public/uploads/${req.file.filename}`
        : user.cover_image;
    }

    // Save the updated user
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      cover_image: updatedUser.cover_image, // Include the cover image in the response
      role: updatedUser.user_type.role,
      teacher_data: updatedUser.user_type.teacher_data,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  deleteUser,
};
