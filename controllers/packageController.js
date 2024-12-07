// controllers/packageController.js
const Package = require("../models/packageModel");

// Get all packages
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true });
    res.json(packages);
  } catch (error) {
    res.status(500).json({
      message: "Error getting packages",
      error: error.message,
    });
  }
};

// Create new package
const createPackage = async (req, res) => {
  try {
    const { name, description, duration, price, sessionCount, instrument } =
      req.body;

    // Validate duration
    if (![30, 45, 60].includes(duration)) {
      return res.status(400).json({
        message: "Invalid duration. Must be 30, 45, or 60 minutes",
      });
    }

    // Validate instrument
    // Optional, detele aja kalau mau validasi di frontendnya. Ini cuman buat di postman to make it ez.
    const validInstruments = [
      "Piano",
      "Vokal",
      "Drum",
      "Gitar",
      "Biola",
      "Bass",
    ];
    if (!validInstruments.includes(instrument)) {
      return res.status(400).json({ message: "Invalid instrument" });
    }

    const package = new Package({
      name,
      description,
      duration,
      price,
      sessionCount,
      instrument,
    });

    const savedPackage = await package.save();
    res.status(201).json(savedPackage);
  } catch (error) {
    res.status(400).json({
      message: "Error creating package",
      error: error.message,
    });
  }
};

// Update package
const updatePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    res.status(400).json({
      message: "Error updating package",
      error: error.message,
    });
  }
};

// Delete package (soft delete)
// Soft Delete = set isActive to false to mark the package as deleted
// Ganti aja kalau mau hard delete
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: "Error deleting package",
      error: error.message,
    });
  }
};

module.exports = {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
};
