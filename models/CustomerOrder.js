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
    receiverMobileNumber: { type: String, default: "" },
    conversationId: { type: String, default: "" },
    sendingLocation: { type: Boolean, default: false },
    paymentStatus: { type: Boolean, default: true },
    driverPayment: { type: Boolean, default: false },
    parcelStatus: { type: String, default: "pending" },
    driverStatus: { type: Boolean, default: false },
    customerStatus: { type: Boolean, default: false },
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