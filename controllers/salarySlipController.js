const SalarySlip = require("../models/salarySlipModel");
const StudentPackage = require("../models/studentPackageModel");
const User = require("../models/userModel");
const PDFDocument = require("pdfkit");

// Get all salary slips (Admin only)
const getAllSalarySlips = async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find().populate("teacher_id", "name");
    res.status(200).json({
      success: true,
      data: salarySlips,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get teacher's salary slip (Teacher and Admin)
const getTeacherSalarySlip = async (req, res) => {
  try {
    const { teacherId, month, year } = req.params;
    const salarySlip = await SalarySlip.findOne({
      teacher_id: teacherId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate("teacher_id", "name");

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    res.status(200).json({
      success: true,
      data: salarySlip,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update or create salary slip (called when a schedule is created or updated)
const updateSalarySlip = async (
  teacherId,
  schedule,
  studentName,
  instrument
) => {
  const month = schedule.date.getMonth() + 1;
  const year = schedule.date.getFullYear();

  let salarySlip = await SalarySlip.findOne({
    teacher_id: teacherId,
    month,
    year,
  });

  if (!salarySlip) {
    salarySlip = new SalarySlip({
      teacher_id: teacherId,
      month,
      year,
      total_salary: 0,
      details: [],
    });
  }

  const totalFee = schedule.teacher_fee + schedule.transport_fee;

  // Check if the detail already exists
  const existingDetailIndex = salarySlip.details.findIndex(
    (detail) => detail.date.toISOString() === schedule.date.toISOString()
  );

  if (existingDetailIndex !== -1) {
    // Update existing detail
    salarySlip.details[existingDetailIndex] = {
      student_name: studentName,
      instrument,
      date: schedule.date,
      room: schedule.room,
      attendance_status: schedule.attendance_status,
      note: schedule.note,
      fee_class: schedule.teacher_fee,
      fee_transport: schedule.transport_fee,
      total_fee: totalFee,
    };
  } else {
    // Add new detail
    salarySlip.details.push({
      student_name: studentName,
      instrument,
      date: schedule.date,
      room: schedule.room,
      attendance_status: schedule.attendance_status,
      note: schedule.note,
      fee_class: schedule.teacher_fee,
      fee_transport: schedule.transport_fee,
      total_fee: totalFee,
    });
  }

  // Recalculate total_salary
  salarySlip.total_salary = salarySlip.details.reduce((total, detail) => {
    return detail.attendance_status === "Success"
      ? total + detail.total_fee
      : total;
  }, 0);

  await salarySlip.save();
};

// Download salary slip as PDF (Admin only)
const downloadSalarySlipPDF = async (req, res) => {
  try {
    const { teacherId, month, year } = req.params;
    const salarySlip = await SalarySlip.findOne({
      teacher_id: teacherId,
      month: parseInt(month),
      year: parseInt(year),
    }).populate("teacher_id", "name");

    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: "Salary slip not found",
      });
    }

    const teacher = await User.findById(teacherId);

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=salary_slip_${teacher.name}_${month}_${year}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(24).text("Slip Gaji", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Nama: ${teacher.name}`, { align: "left" });
    doc.text(`Bulan: ${month}/${year}`, { align: "left" });
    doc.text(
      `Total Gaji: Rp.${salarySlip.total_salary.toLocaleString("id-ID")}`,
      { align: "left" }
    );
    doc.moveDown();

    const tableTop = 200;
    const tableLeft = 20;
    const columnWidths = [70, 80, 80, 60, 70, 70, 70, 70];
    const headers = [
      "Date",
      "Student",
      "Instrument",
      "Room",
      "Status",
      "Class Fee",
      "Transport",
      "Total",
    ];

    doc.font("Helvetica-Bold");
    let xPosition = tableLeft;
    headers.forEach((header, i) => {
      doc.text(header, xPosition, tableTop, {
        width: columnWidths[i],
        align: "center",
      });
      xPosition += columnWidths[i];
    });

    doc.font("Helvetica");
    let yPosition = tableTop + 25;

    salarySlip.details.forEach((detail, index) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      xPosition = tableLeft;
      [
        detail.date.toLocaleDateString(),
        detail.student_name,
        detail.instrument,
        detail.room,
        detail.attendance_status,
        `${detail.fee_class.toLocaleString("id-ID")}`,
        `${detail.fee_transport.toLocaleString("id-ID")}`,
        `${detail.total_fee.toLocaleString("id-ID")}`,
      ].forEach((text, i) => {
        doc.text(text, xPosition, yPosition, {
          width: columnWidths[i],
          align: "center",
        });
        xPosition += columnWidths[i];
      });

      yPosition += 20;
    });

    doc.lineWidth(1);
    doc
      .moveTo(tableLeft, tableTop)
      .lineTo(tableLeft + columnWidths.reduce((a, b) => a + b, 0), tableTop)
      .stroke();
    doc
      .moveTo(tableLeft, tableTop + 20)
      .lineTo(
        tableLeft + columnWidths.reduce((a, b) => a + b, 0),
        tableTop + 20
      )
      .stroke();

    doc.end();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllSalarySlips,
  getTeacherSalarySlip,
  updateSalarySlip,
  downloadSalarySlipPDF,
};
