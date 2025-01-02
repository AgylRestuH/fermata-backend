const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const {
  registerUser,
  loginUser,
  logout,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, asyncHandler(logout));

module.exports = router;
