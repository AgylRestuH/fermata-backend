const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: function () {
        return this.user_type.role !== "admin";
      },
    },
    address: {
      type: String,
      required: function () {
        return this.user_type.role !== "admin";
      },
    },
    user_type: {
      role: {
        type: String,
        enum: ["admin", "teacher", "student"],
        required: true,
      },
      teacher_data: {
        instruments: [
          {
            type: String,
            enum: ["Piano", "Vokal", "Drum", "Gitar", "Biola", "Bass"],
          },
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
