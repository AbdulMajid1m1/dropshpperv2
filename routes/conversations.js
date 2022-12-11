const router = require("express").Router();
const Conversation = require("../models/Conversation");
const isAuth = require("../middleware/auth");
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Message = require("../models/Message");

//new conv
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get conv of a user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


// get all conservation Messages
router.get("/get-all-chat/:conservationId", async (req, res) => {
  let membersArray = [];
  Conversation.findOne({ _id: req.params.conservationId }, (err, chat) => {

    if (!err) {
      User.findOne({ _id: chat.members.senderId }, (err, senderData) => {
        if (err) {
          console.log(err);
        }
        else if (senderData !== null) {

          membersArray.push({ senderId: senderData._id, senderName: senderData.fullName });
          User.findOne({ _id: chat.members.receiverId }, (err, receiverData) => {
            if (err) {
              console.log(err);
            }
            else {
              membersArray.push({ receiverId: receiverData._id, receiverName: receiverData.fullName });
              Driver.findOne({ _id: chat.members.driverId }, (err, driverData) => {
                if (!err) {
                  membersArray.push({ driverData: driverData._id, receiverName: driverData.fullName });
                  Message.find({ conversationId: req.params.conservationId }, (err, messages) => {
                    if (!err) {
                      res.status(200).json({ MembersData: membersArray, ChatMessages: messages });

                    } else {
                      res.status(500).json({ error: err });
                    }
                  }).sort({ _id: -1 })
                } else {
                  console.log(err);
                }
              });

            }
          });
        }
        else {
          res.status(400).json({ error: "cannot find sender" })
        }
      })





    } else {
      res.status(500).json({ error: err });
    }

  })
});

// Conversation.findOne({ _id: req.params.conservationId }, (err, chat) => {
//   if (err) {
//     res.json(err)
//   }
//   else {
//     res.json(chat);
//   }
// })
// });

module.exports = router;
