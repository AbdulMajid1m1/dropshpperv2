const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const Notification = require("../models/Notification");
const cloudinary = require("cloudinary").v2;
const isAuth = require("../middleware/auth");

router.get("/register/address-info", isAuth, function (req, res) {
  res.send("send address information form page");
});

// User profile update page
router.get("/profile", isAuth, function (req, res) {
  res.send("Send Infomartion update form");
});
router.get("/profiles/user-information", isAuth, function (req, res) {
  res.send("Send Customer profile update form");
});
router.get("/profiles/address", isAuth, function (req, res) {
  res.send("Send Customer address info update form");
});

router.get("/profile/notifications", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  // res.send("Send Customer notifications page");
  Notification.find({ receiverId: uniqueId }, (err, notification) => {
    if (!err) {
      res.status(200).json(notification);
    } else {
      res.status(501).json(err);
    }
  }).sort({ createdAt: -1 });
});
router.get("/profile/agreement", isAuth, function (req, res) {
  res.send("Send agreement page");
});

//address information post route
router.post("/register/address-info", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  User.findOneAndUpdate(
    { _id: uniqueId },
    {
      $set: {
        country: req.body.country,
        region: req.body.region,
        city: req.body.city,
        streetAddress: req.body.streetAddress,
      },
    },
    { new: true },
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        // console.log("successfully because email match");
        return res.send("User address info updated ");
      }
    }
  );
});

// updating address info


router.post("/upload-img", function (req, res) {
  try {
    const userPicture = req.files.userPicture;
    cloudinary.uploader.upload(userPicture.tempFilePath, (err, picture) => {
      if (!err) {
        res.status(200).json({ PictureUrl: picture.url });
      } else {
        res.status(400).json({ error: err });
      }
    });
  } catch (error) {
    res.status(400).json({ Error: error });
  }
});



module.exports = router;
