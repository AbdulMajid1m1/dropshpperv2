const router = require("express").Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const isAuth = require("../middleware/auth");

//add
router.post("/", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/find/:parcelId/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      $and: [
        { parcelId: req.params.parcelId },
        {
          members: {
            $all: [
              req.params.firstUserId,
              req.params.secondUserId,
              // "6303e70971259b758c3c4058",
              req.params.parcelId,
            ],
          },
        },
      ],
    });
    console.log("check");
    console.log(conversation);
    // res.status(200).json(conversation);
    try {
      const messages = await Message.find({
        conversationId: conversation._id,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// router.get("/:conversationId", async (req, res) => {
//   try {
//     const messages = await Message.find({
//       conversationId: req.params.conversationId,
//     });
//     res.status(200).json(messages);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;
