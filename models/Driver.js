const mongoose = require("mongoose");

// DRIVER SCHEMA
const driverSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"] },
    registrationNo: String,
    make: Number,
    model: Number,
    year: Number,
    licenseNumber: {
      type: Number,
      required: [true, "License Number is required"],
    },
    DrivingFor: Number,
    licenseFrontImg: {
      type: String,
      required: [true, "License front image is required"],
    },
    licenseBackImg: {
      type: String,
      required: [true, "License back image is required"],
    },

    // user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    user: { type: String, default: "" },
    parcelsUnderway: [
      { type: mongoose.Schema.Types.ObjectId, ref: "customersorders" },
    ],
    parcelsCompleted: [
      { type: mongoose.Schema.Types.ObjectId, ref: "customersorders" },
    ],
    reviews: [
      {
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        rating: Number,
        review: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
