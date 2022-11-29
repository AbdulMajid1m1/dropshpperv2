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

/////  GET DIVER DATA START /////////////
router.get("/get-driver-data/:id", function (req, res) {
  Driver.findOne({ _id: req.params.id }, function (err, user) {
    if (!err) {
      res.status(200).json({ DriverData: user, uuid: user._id });
    }
    if (err) {
      res.status(400).json({ Error: err });
    }
  });
});
/////  GET DIVER DATA END /////////////

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
router.post("/update/driver-profile/:id", function (req, res) {
  // let uniqueId =
  //   req.user == undefined ? req.app.locals.userId._id : req.user._id;

  Driver.findOne({ _id: req.params.id }, function (err, user) {
    if (!err) {
      try {
        // const userPicture = req.files.userPicture;
        // cloudinary.uploader.upload(userPicture.tempFilePath, (err, picture) => {

        if (user.username === req.body.username) {
          Driver.findOneAndUpdate(
            { _id: req.params.id },
            // {
            //   $set: {
            //     fullName:
            //       req.body.fullName.length === 0
            //         ? user.fullName
            //         : req.body.fullName,
            //     mobileNumber:
            //       req.body.mobileNumber.length === 0
            //         ? user.mobileNumber
            //         : req.body.mobileNumber,
            //     username:
            //       req.body.username.length === 0
            //         ? user.username
            //         : req.body.username,
            //     userPicture: picture.url,
            //   },
            // },
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
                res.status(400).json({ Error: err });
              } else {
                return res.status(200).json({ UpdatedInfo: result });
              }
            }
          );
        } else {
          Driver.findOne({ username: req.body.username }, (err, foundUser) => {
            if (err) {
              res.status(400).json({ Error: err });
            } else {
              if (foundUser === null) {
                Driver.findOneAndUpdate(
                  { _id: req.params.id },
                  // {
                  //   $set: {
                  //     fullName:
                  //       req.body.fullName.length === 0
                  //         ? user.fullName
                  //         : req.body.fullName,
                  //     mobileNumber:
                  //       req.body.mobileNumber.length === 0
                  //         ? user.mobileNumber
                  //         : req.body.mobileNumber,
                  //     username:
                  //       req.body.username.length === 0
                  //         ? user.username
                  //         : req.body.username,
                  //     userPicture: picture.url,
                  //   },
                  // },
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
                      res.status(400).json({ Error: err });
                    } else {
                      return res.status(200).json({ UpdatedInfo: result });
                    }
                  }
                );
              } else {
                res.send("This username already in use");
              }
            }
          });
        }
      } catch (e) {
        res.status(400).json({ Error: e });
      }
    }
    if (err) {
      res.status(400).json({ Error: err });
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
