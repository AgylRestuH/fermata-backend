const User = require("../models/userModel");
const Package = require("../models/packageModel");
const StudentPackage = require("../models/studentPackageModel");

const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const usersByRole = await User.aggregate([
      { $group: { _id: "$user_type.role", count: { $sum: 1 } } },
    ]);

    const latestUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email user_type.role createdAt");

    const totalActivePackages = await Package.countDocuments({
      isActive: true,
    });

    const activePackages = await Package.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name description price sessionCount instrument");

    const totalRevenue = await StudentPackage.aggregate([
      { $match: { payment_status: "Lunas" } },
      { $group: { _id: null, total: { $sum: "$payment_total" } } },
    ]);

    const latestPayments = await StudentPackage.find({
      payment_status: "Lunas",
    })
      .sort({ payment_date: -1 })
      .limit(5)
      .populate("student_id", "name")
      .populate("package_id", "name");

    const paymentStatusCount = await StudentPackage.aggregate([
      { $group: { _id: "$payment_status", count: { $sum: 1 } } },
    ]);

    const scheduleStatusCount = await StudentPackage.aggregate([
      { $unwind: "$schedules" },
      { $group: { _id: "$schedules.attendance_status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      totalUsers,
      usersByRole,
      latestUsers,
      totalActivePackages,
      activePackages,
      totalRevenue: totalRevenue[0]?.total || 0,
      latestPayments,
      paymentStatusCount,
      scheduleStatusCount,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getStatistics };
