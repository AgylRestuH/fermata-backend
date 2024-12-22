require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Base route untuk testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Fermata API" });
});

// Routes
const userRoutes = require("./routes/userRoutes");
const packageRoutes = require("./routes/packageRoutes");
const studentPackageRoutes = require("./routes/studentPackageRoutes");
const salarySlipRoutes = require("./routes/salarySlipRoutes");

// Validate routes first, then import before using them
if (!userRoutes || !packageRoutes) {
  throw new Error("Required routes are not properly imported");
}

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/student-packages", studentPackageRoutes);
app.use("/api/salary-slips", salarySlipRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Debuggingg
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Body:", req.body);
  next();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection:", err);
  // Optional:
  // close server & exit process
  // server.close(() => process.exit(1));
});
