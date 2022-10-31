const router = require("express").Router();
const User = require("../models/User");
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

router.post("/profiles/user-information", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;

  User.findOne({ _id: uniqueId }, isAuth, function (err, user) {
    if (!err) {
      try {
        const userPicture = req.files.userPicture;
        cloudinary.uploader.upload(userPicture.tempFilePath, (err, picture) => {
          User.findOne({ username: req.body.username }, (err, foundUser) => {
            if (err) {
              console.log(err);
              console.log("dfadsfdsafasdf");
            } else {
              if (foundUser == null) {
                User.findOneAndUpdate(
                  { _id: uniqueId },
                  {
                    $set: {
                      fullName:
                        req.body.fullName.length === 0
                          ? user.fullName
                          : req.body.fullName,
                      mobileNumber:
                        req.body.mobileNumber.length === 0
                          ? user.mobileNumber
                          : req.body.mobileNumber,
                      username:
                        req.body.username.length === 0
                          ? user.username
                          : req.body.username,
                      userPicture: picture.url,
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
              } else {
                res.send("username already in use");
              }
            }
          });
        });
        console.log("try run");
      } catch (e) {
        console.log("catch run");

        User.findOne({ username: req.body.username }, (err, foundUser) => {
          if (err) {
            console.log(err);
            console.log("dfadsfdsafasdf");
          } else {
            if (foundUser == null) {
              User.findOneAndUpdate(
                { _id: uniqueId },
                {
                  $set: {
                    fullName:
                      req.body.fullName.length === 0
                        ? user.fullName
                        : req.body.fullName,
                    mobileNumber:
                      req.body.mobileNumber.length === 0
                        ? user.mobileNumber
                        : req.body.mobileNumber,
                    username:
                      req.body.username.length === 0
                        ? user.username
                        : req.body.username,
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
            } else {
              res.send("username already in use");
            }
          }
        });
      }
    }
    if (err) {
      console.log(err);
    }
  });
});

// Address update form

router.post("/profiles/address", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  User.findOne({ _id: uniqueId }, (err, user) => {
    if (err) {
      return res.json(err);
    } else {
      User.findOneAndUpdate(
        { _id: uniqueId },
        {
          $set: {
            country:
              req.body.country.length === 0 ? user.country : req.body.country,
            region:
              req.body.region.length === 0 ? user.region : req.body.region,
            city: req.body.city.length === 0 ? user.city : req.body.city,
            streetAddress:
              req.body.streetAddress.length === 0
                ? user.streetAddress
                : req.body.streetAddress,
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
    }
  });
});

module.exports = router;
a