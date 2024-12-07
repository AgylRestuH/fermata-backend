const express = require("express");
const router = express.Router();
const { protect, admin, teacher } = require("../middleware/authMiddleware");
const {
  createStudentPackage,
  getAllStudentPackages,
  updateSchedule,
  deleteStudentPackage,
  deleteSchedule,
  getTeacherSchedules,
  updateAttendance,
  getStudentSchedules,
  addSchedule,
} = require("../controllers/studentPackageController");

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Admin routes
router
  .route("/")
  .post(protect, admin, asyncHandler(createStudentPackage))
  .get(protect, admin, asyncHandler(getAllStudentPackages));

router
  .route("/:studentPackageId/schedules/:scheduleId")
  .put(protect, admin, asyncHandler(updateSchedule))
  .delete(protect, admin, asyncHandler(deleteSchedule));

router.delete(
  "/:studentPackageId",
  protect,
  admin,
  asyncHandler(deleteStudentPackage)
);

router.post(
  "/:studentPackageId/schedules",
  protect,
  admin,
  asyncHandler(addSchedule)
);

// Teacher routes
router.get(
  "/schedules/teacher",
  protect,
  teacher,
  asyncHandler(getTeacherSchedules)
);

router.put(
  "/:studentPackageId/schedules/:scheduleId/attendance",
  protect,
  teacher,
  asyncHandler(updateAttendance)
);

// Student routes
router.get("/schedules/student", protect, asyncHandler(getStudentSchedules));

module.exports = router;
