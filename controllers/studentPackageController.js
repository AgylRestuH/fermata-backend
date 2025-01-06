const StudentPackage = require("../models/studentPackageModel");
const User = require("../models/userModel");
const Package = require("../models/packageModel");
const { updateSalarySlip } = require("./salarySlipController");

const createStudentPackage = async (req, res) => {
  try {
    const {
      student_id,
      package_id,
      payment_status,
      payment_total,
      payment_date,
      date_periode,
      schedules,
    } = req.body;

    if (!["Belum Lunas", "Lunas", "Dibatalkan"].includes(payment_status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const studentUser = await User.findOne({
      _id: student_id,
      "user_type.role": "student",
    });

    if (!studentUser) {
      return res.status(400).json({
        success: false,
        message: "Student not found or invalid user type",
      });
    }

    const studentPackage = await StudentPackage.create({
      student_id,
      package_id,
      payment_status,
      payment_total,
      payment_date,
      date_periode,
      schedules,
    });

    const package = await Package.findById(package_id);
    for (const schedule of studentPackage.schedules) {
      await updateSalarySlip(
        schedule.teacher_id,
        schedule,
        studentUser.name,
        package.instrument
      );
    }

    res.status(201).json({
      success: true,
      data: studentPackage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStudentPackages = async (req, res) => {
  try {
    const studentPackages = await StudentPackage.find()
      .populate("student_id", "name email phone")
      .populate("package_id", "name description duration price")
      .populate("schedules.teacher_id", "name");

    res.status(200).json({
      success: true,
      data: studentPackages,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getDetailStudentPackage = async (req, res) => {
  try {
    const studentPackage = await StudentPackage.findById(req.params.id)
      .populate("student_id", "name email phone")
      .populate("package_id", "name description duration price")
      .populate("schedules.teacher_id", "name");

    if (!studentPackage) {
      return res.status(404).json({ message: "Student package not found" });
    }

    res.json(studentPackage);
  } catch (error) {
    res.status(400).json({
      message: "Error getting student package details",
      error: error.message,
    });
  }
};

const getTeacherSchedules = async (req, res) => {
  try {
    const schedules = await StudentPackage.find({
      "schedules.teacher_id": req.user.id,
    })
      .populate("student_id", "name")
      .populate("package_id", "name description")
      .select("schedules");

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudentSchedules = async (req, res) => {
  try {
    const schedules = await StudentPackage.find({
      student_id: req.user.id,
    })
      .populate("schedules.teacher_id", "name")
      .populate("package_id", "name description")
      .select("schedules package_id");

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { studentPackageId, scheduleId } = req.params;
    const { attendance_status, note } = req.body;

    if (
      ![
        "Belum Berlangsung",
        "Success",
        "Murid Izin",
        "Guru Izin",
        "Reschedule",
      ].includes(attendance_status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance status",
      });
    }

    const studentPackage = await StudentPackage.findById(studentPackageId);
    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Student package not found",
      });
    }

    const schedule = studentPackage.schedules.id(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    if (
      req.user.user_type.role !== "admin" &&
      schedule.teacher_id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this schedule",
      });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:8080";

    schedule.attendance_status = attendance_status;
    schedule.activity_photo = req.file
      ? `${baseUrl}/public/uploads/${req.file.filename}`
      : schedule.activity_photo;
    schedule.note = note;

    await studentPackage.save();

    const student = await User.findById(studentPackage.student_id);
    const package = await Package.findById(studentPackage.package_id);
    await updateSalarySlip(
      schedule.teacher_id,
      schedule,
      student.name,
      package.instrument
    );

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllSchedules = async (req, res) => {
  try {
    const studentPackages = await StudentPackage.find()
      .populate("student_id", "name email phone")
      .populate("package_id", "name description duration price instrument")
      .populate("schedules.teacher_id", "name email phone");

    const formattedSchedules = studentPackages.map((pkg) => ({
      _id: pkg._id, // Student Package ID di level atas
      student_id: pkg.student_id,
      package_id: pkg.package_id,
      schedules: pkg.schedules.map((schedule) => ({
        _id: schedule._id, // Schedule ID
        teacher_id: schedule.teacher_id,
        date: schedule.date,
        time: schedule.time,
        transport_fee: schedule.transport_fee,
        teacher_fee: schedule.teacher_fee,
        room: schedule.room,
        attendance_status: schedule.attendance_status || "Belum Berlangsung",
        note: schedule.note || "-",
        activity_photo: schedule.activity_photo || "-",
      })),
    }));

    res.status(200).json({
      success: true,
      data: formattedSchedules,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { studentPackageId, scheduleId } = req.params;
    const { teacher_id, date, time, transport_fee, teacher_fee, room } =
      req.body;

    const studentPackage = await StudentPackage.findById(studentPackageId);
    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Student package not found",
      });
    }

    const schedule = studentPackage.schedules.id(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    if (teacher_id) schedule.teacher_id = teacher_id;
    if (date) schedule.date = new Date(date);
    if (time) schedule.time = time;
    if (transport_fee !== undefined) schedule.transport_fee = transport_fee;
    if (teacher_fee !== undefined) schedule.teacher_fee = teacher_fee;
    if (room) schedule.room = room;

    await studentPackage.save();

    const student = await User.findById(studentPackage.student_id);
    const package = await Package.findById(studentPackage.package_id);
    await updateSalarySlip(
      schedule.teacher_id,
      schedule,
      student.name,
      package.instrument
    );

    res.status(200).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const addSchedule = async (req, res) => {
  try {
    const { studentPackageId } = req.params;
    const { teacher_id, date, time, transport_fee, teacher_fee, room } =
      req.body;

    const studentPackage = await StudentPackage.findById(studentPackageId);
    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Student package not found",
      });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const newSchedule = {
      teacher_id,
      date: parsedDate,
      time,
      transport_fee,
      teacher_fee,
      room,
      attendance_status: "Belum Berlangsung",
    };

    studentPackage.schedules.push(newSchedule);
    await studentPackage.save();

    try {
      const student = await User.findById(studentPackage.student_id);
      const package = await Package.findById(studentPackage.package_id);
      await updateSalarySlip(
        newSchedule.teacher_id,
        newSchedule,
        student.name,
        package.instrument
      );
    } catch (error) {}

    res.status(200).json({
      success: true,
      message: "Schedule added successfully",
      data: studentPackage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteStudentPackage = async (req, res) => {
  try {
    const studentPackage = await StudentPackage.findById(
      req.params.studentPackageId
    );

    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Student package not found",
      });
    }

    await studentPackage.deleteOne();

    res.status(200).json({
      success: true,
      message: "Student package deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { studentPackageId, scheduleId } = req.params;

    const studentPackage = await StudentPackage.findById(studentPackageId);
    if (!studentPackage) {
      return res.status(404).json({
        success: false,
        message: "Student package not found",
      });
    }

    const scheduleIndex = studentPackage.schedules.findIndex(
      (schedule) => schedule._id.toString() === scheduleId
    );

    if (scheduleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    studentPackage.schedules.splice(scheduleIndex, 1);
    await studentPackage.save();

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createStudentPackage,
  getAllStudentPackages,
  getDetailStudentPackage,
  getTeacherSchedules,
  getStudentSchedules,
  updateAttendance,
  updateSchedule,
  deleteStudentPackage,
  deleteSchedule,
  addSchedule,
  getAllSchedules,
};
