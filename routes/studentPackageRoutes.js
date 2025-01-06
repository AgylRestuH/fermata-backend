const express = require("express");
const router = express.Router();
const { protect, admin, teacher } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const {
  createStudentPackage,
  getAllStudentPackages,
  getDetailStudentPackage,
  updateSchedule,
  deleteStudentPackage,
  deleteSchedule,
  getTeacherSchedules,
  updateAttendance,
  getStudentSchedules,
  addSchedule,
  getAllSchedules,
} = require("../controllers/studentPackageController");

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router
  .route("/")
  .post(protect, admin, asyncHandler(createStudentPackage))
  .get(protect, admin, asyncHandler(getAllStudentPackages));

router.get("/:id", protect, admin, asyncHandler(getDetailStudentPackage));

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

router.get("/schedules/all", protect, admin, asyncHandler(getAllSchedules));

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
  upload.single("activity_photo"),
  asyncHandler(updateAttendance)
);

router.put(
  "/:studentPackageId/schedules/:scheduleId/attendance",
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
  upload.single("activity_photo"),
  asyncHandler(updateAttendance)
);

router.get("/schedules/student", protect, asyncHandler(getStudentSchedules));

module.exports = router;
