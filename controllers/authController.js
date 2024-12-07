const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register User (Admin, Teacher, Student)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, teacher_data } =
      req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create base user data
    let userData = {
      name,
      email,
      password: hashedPassword,
      user_type: { role },
    };

    // Add phone n address (non-admin)
    if (role !== "admin") {
      if (!phone || !address) {
        return res.status(400).json({
          message: "Phone and address required for teachers and students",
        });
      }
      userData = {
        ...userData,
        phone,
        address,
      };
    }

    // Add role-specific data
    // Teacher add instruments field???
    if (role === "teacher") {
      if (!teacher_data || !teacher_data.instruments) {
        return res
          .status(400)
          .json({ message: "Instruments required for teacher" });
      }
      userData.user_type.teacher_data = {
        instruments: teacher_data.instruments,
      };
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.user_type.role,
      teacher_data: user.user_type.teacher_data,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.user_type.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    // Logging: logout user
    console.log(`User ${req.user.id} logged out`);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
};
