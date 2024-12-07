const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      enum: [30, 45, 60],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    sessionCount: {
      type: Number,
      required: true,
    },
    instrument: {
      type: String,
      enum: ["Piano", "Vokal", "Drum", "Gitar", "Biola", "Bass"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
