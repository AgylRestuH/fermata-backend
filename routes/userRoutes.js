const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getUsers,
  deleteUser,
  updateUserProfile,
} = require("../controllers/userController");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/profile", protect, asyncHandler(getProfile));
router.put(
  "/profile",
  protect,
  upload.single("cover_image"),
  asyncHandler(updateProfile)
);

router.get("/", protect, admin, asyncHandler(getUsers));
router.delete("/:id", protect, admin, asyncHandler(deleteUser));
router.put(
  "/profile/:id",
  protect,
  admin,
  upload.single("cover_image"),
  asyncHandler(updateUserProfile)
);

module.exports = router;
