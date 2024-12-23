const User = require("../models/userModel");
const upload = require("../middleware/uploadMiddleware");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    if (user.user_type.role !== "admin") {
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
    }

    if (user.user_type.role === "teacher" && req.body.teacher_data) {
      user.user_type.teacher_data = {
        instruments:
          req.body.teacher_data.instruments ||
          user.user_type.teacher_data.instruments,
      };
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:8080";

    if (req.file) {
      user.cover_image = `${baseUrl}/public/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      cover_image: updatedUser.cover_image,
      role: updatedUser.user_type.role,
      teacher_data: updatedUser.user_type.teacher_data,
      password: updatedUser.password,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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

const adminUpdateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (user.user_type.role === "teacher" && req.body.teacher_data) {
      user.user_type.teacher_data.instruments =
        req.body.teacher_data.instruments ||
        user.user_type.teacher_data.instruments;
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:8080";

    if (req.file) {
      user.cover_image = `${baseUrl}/public/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      cover_image: updatedUser.cover_image,
      role: updatedUser.user_type.role,
      teacher_data: updatedUser.user_type.teacher_data,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getUsers,
  deleteUser,
  adminUpdateUser,
};
