// const mongoose = require("mongoose");

// // DRIVER SCHEMA
// const driverSchema = new mongoose.Schema(
//   {
//     fullName: { type: String, default: "" },
//     mobileNumber: { type: String, default: "" },
//     username: {
//       type: String,
//       unique: true,
//     },
//     password: String,
//     country: { type: String, default: "" },
//     region: { type: String, default: "" },
//     city: { type: String, default: "" },
//     streetAddress: { type: String, default: "" },
//     // userType: { type: String, default: "" },
//     NameOnLicense: { type: String, required: [true, "Name is required"] },

//     userPicture: { type: String, default: "" },
//     registrationNo: String,
//     make: Number,
//     model: Number,
//     year: Number,
//     licenseNumber: {
//       type: Number,
//       required: [true, "License Number is required"],
//     },
//     DrivingFor: Number,
//     licenseFrontImg: {
//       type: String,
//       required: [true, "License front image is required"],
//     },
//     licenseBackImg: {
//       type: String,
//       required: [true, "License back image is required"],
//     },

//     // user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
//     // user: { type: String, default: "" },
//     // parcelsUnderway: [
//     //   { type: mongoose.Schema.Types.ObjectId, ref: "customersorders" },
//     // ],
//     // parcelsCompleted: [
//     //   { type: mongoose.Schema.Types.ObjectId, ref: "customersorders" },
//     // ],
//     // reviews: [
//     //   {
//     //     reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
//     //     rating: Number,
//     //     review: String,
//     //   },
//     // ],
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Driver", driverSchema);


var uniqueValidator = require("mongoose-unique-validator");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const mongoose = require("mongoose");

// DRIVER SCHEMA
const driverSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    username: {
      type: String,
      unique: true,
    },
    password: String,
    // googleId: String,
    // facebookId: String,
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    streetAddress: { type: String, default: "" },
    NameOnLicense: { type: String, required: [true, "Name is required"] },
    registrationNo: String,
    make: Number,
    year: Number,
    licenseNumber: {
      type: Number,
      required: [true, "License Number is required"],
    },
    DrivingFor: Number,
    Model:Number,
  },
  
  { timestamps: true }
);

driverSchema.plugin(uniqueValidator);
driverSchema.plugin(passportLocalMongoose);

driverSchema.plugin(findOrCreate);

module.exports = mongoose.model("Driver", driverSchema);
