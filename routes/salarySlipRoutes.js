const express = require("express");
const router = express.Router();
const { protect, admin, teacher } = require("../middleware/authMiddleware");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const {
  getAllSalarySlips,
  getTeacherSalarySlip,
  downloadSalarySlipPDF,
} = require("../controllers/salarySlipController");

// router.post("/", protect, admin, generateSalarySlip);
router.get("/", protect, admin, asyncHandler(getAllSalarySlips));
// router.put("/:id", protect, admin, updateSalarySlip);
// router.delete("/:id", protect, admin, deleteSalarySlip);
router.get(
  "/:teacherId/:month/:year",
  protect,
  (req, res, next) => {
    if (
      req.user?.user_type?.role === "admin" ||
      req.user?.user_type?.role === "teacher"
    ) {
      next();
    } else {
      res.status(403).json({
        message: "Not authorized - requires admin or teacher role",
      });
    }
  },
  asyncHandler(getTeacherSalarySlip)
);

router.get(
  "/download/:teacherId/:month/:year",
  protect,
  admin,
  asyncHandler(downloadSalarySlipPDF)
);

module.exports = router;
