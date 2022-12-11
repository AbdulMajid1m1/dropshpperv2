const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customersorders",
    },
    // members: {
    //   type: Array,
    // },
    members: {
      senderId: { type: mongoose.Types.ObjectId, default: "" },
      receiverId: { type: mongoose.Types.ObjectId, default: "" },
      driverId: { type: mongoose.Types.ObjectId, default: "" },

    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
