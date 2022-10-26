const mongoose = require("mongoose");
// CUSTOMER ORDER SCHEMA
const customerOrderSchema = new mongoose.Schema(
  {
    senderName: { type: String, required: [true, "Name is required"] },
    receiverName: String,
    receiverEmail: String,
    pickupAddress: String,
    destinationAddress: {
      type: String,
      required: [true, "Destination address is required"],
    },
    size: String,
    offer: { type: Number, required: [true, "Amount is required"] },
    message: String,
    sendingLocation: { type: Boolean, default: false },
    paymentStatus: { type: Boolean, default: false },
    driverPayment: { type: Boolean, default: false },
    parcelStatus: { type: String, default: "pending" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "drivers",
      default: null,
    },
  },
  { timestamps: true }
);

// CUSTOMER ORDER MODEL
module.exports = mongoose.model("CustomerOrder", customerOrderSchema);
