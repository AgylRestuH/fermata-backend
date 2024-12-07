const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  transport_fee: {
    type: Number,
    default: 0,
  },
  teacher_fee: {
    type: Number,
    required: true,
  },
  attendance_status: {
    type: String,
    enum: [
      "Belum Berlangsung",
      "Success",
      "Murid Izin",
      "Guru Izin",
      "Reschedule",
    ],
  },
  room: {
    type: String,
    enum: ["Ruang 1", "Ruang 2", "Ruang 3", "Home Visit"],
  },
  activity_photo: {
    type: String,
  },
  note: String,
});

const studentPackageSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["Belum Lunas", "Lunas", "Dibatalkan"],
      default: "Belum Lunas",
    },
    payment_total: {
      type: Number,
      required: true,
    },
    payment_date: {
      type: Date,
    },
    date_periode: [
      {
        start: {
          type: Date,
          required: true,
        },
        end: {
          type: Date,
          required: true,
        },
      },
    ],
    schedules: [scheduleSchema],
  },
  {
    timestamps: true,
  }
);

studentPackageSchema.index({ student_id: 1, payment_status: 1 });
studentPackageSchema.index({ "schedules.teacher_id": 1 });

module.exports = mongoose.model("StudentPackage", studentPackageSchema);
