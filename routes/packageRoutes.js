const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} = require("../controllers/packageController");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/", asyncHandler(getPackages));

router.post("/", protect, admin, asyncHandler(createPackage));
router.put("/:id", protect, admin, asyncHandler(updatePackage));
router.delete("/:id", protect, admin, asyncHandler(deletePackage));

module.exports = router;
