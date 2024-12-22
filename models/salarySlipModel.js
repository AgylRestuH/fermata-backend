const mongoose = require("mongoose");

const salarySlipSchema = new mongoose.Schema(
  {
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    total_salary: {
      type: Number,
      default: 0,
    },
    details: [
      {
        student_name: String,
        instrument: String,
        date: Date,
        room: String,
        attendance_status: String,
        note: String,
        fee_class: Number,
        fee_transport: Number,
        total_fee: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SalarySlip", salarySlipSchema);
