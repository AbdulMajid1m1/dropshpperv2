var uniqueValidator = require("mongoose-unique-validator");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const mongoose = require("mongoose");

// DRIVER SCHEMA
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    username: {
      type: String,
      unique: true,
    },
    password: String,
    googleId: String,
    facebookId: String,
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    streetAddress: { type: String, default: "" },
    userType: { type: String, default: "" },
    userPicture: { type: String, default: "" },
    // pendingOrders: [
    //   { type: mongoose.Schema.Types.ObjectId, ref: "customersorders" },
    // ],
  },
  { timestamps: true }
);

userSchema.plugin(uniqueValidator);
userSchema.plugin(passportLocalMongoose);

userSchema.plugin(findOrCreate);

module.exports = mongoose.model("User", userSchema);
