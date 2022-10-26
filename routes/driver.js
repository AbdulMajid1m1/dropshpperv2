const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const cloudinary = require("cloudinary").v2;
const isAuth = require("../middleware/auth");

//Selecting Drivers Category.
router.get("/drivers", isAuth, function (req, res) {
  res.send("Drivers Registration Page");
});

// Seach results from driver page
router.get("/drivers/search/:searchText", isAuth, function (req, res) {
  // res.send("Drivers Registration Page");
  CustomerOrder.find(
    {
      $or: [
        { pickupAddress: { $regex: req.params.searchText, $options: "i" } },
        {
          destinationAddress: { $regex: req.params.searchText, $options: "i" },
        },
      ],
    },
    function (err, parcels) {
      if (err) {
        console.log(err);
      } else {
        res.send(parcels);
      }
    }
  ).sort({ createdAt: -1 });
});
router.get("/drivers/homepage", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  User.findOne({ _id: uniqueId }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      console.log("user city is " + user.city);

      //q2
      CustomerOrder.find(
        { $and: [{ pickupAddress: user.city }, { parcelStatus: "pending" }] },
        function (err, parcelOne) {
          if (err) {
            console.log(err);
          } else {
            // console.log(parcels);
            // console.log("result other than city");
            //q3 start
            CustomerOrder.find(
              {
                $and: [
                  { pickupAddress: { $ne: user.city } },
                  { parcelStatus: "pending" },
                ],
              },
              function (err, parcelTwo) {
                if (err) {
                  console.log(err);
                } else {
                  // console.log(parcels);
                  let parcels = [...parcelOne, ...parcelTwo];

                  console.log(parcels);
                  // Send Driver Home page from here.
                  res.json(parcels);
                }
              }
            ).sort({ createdAt: -1 });
            //q3 end
          }
        }
      ).sort({ createdAt: -1 });
      //q2 end
    }
  });

  // res.send("Drivers Home Page");
});

// Showing parcel detail page to driver
router.get("/drivers/homepage/:_id", isAuth, function (req, res) {
  // res.send("Drivers Registration Page");
  CustomerOrder.find({ _id: req.params._id }, function (err, order) {
    if (!err) {
      res.json(order);
    }
    if (err) {
      // res.status(500).send("Error getting drivers");
      res.json(err);
    }
  });
});
router.get(
  "/drivers/homepage/receive-payment/:_id",
  isAuth,
  function (req, res) {
    res.send("Send payment receiving form for driver");
  }
);
// app.get("/drivers/deliveries", function (req, res) {
//   res.send("Delivered by driver undrway");
// })

// showing parcels to drivers which are underway
//////////////////////// Port Listening  /////////////////////////////
router.get("/drivers/deliveries/underway", isAuth, function (req, res) {
  // res.send("Send payment receiving form for driver");
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  //q1 start
  Driver.findOne({ user: uniqueId }, (err, driver) => {
    if (err) {
      console.log(err);
    } else {
      console.log("show ID");
      console.log(driver._id);
      CustomerOrder.find(
        {
          $and: [{ driver: driver._id }, { parcelStatus: "underway" }],
        },
        (err, parcel) => {
          if (!err) {
            res.json(parcel);
            console.log(parcel);
          } else {
            res.json(err);
          }
        }
      );
    }
  });
  //q1 end
});
router.get("/drivers/deliveries/completed", isAuth, function (req, res) {
  // res.send("Send payment receiving form for driver");
  //q1 start
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  Driver.findOne({ user: uniqueId }, (err, driver) => {
    if (err) {
      console.log(err);
    } else {
      console.log("show ID");
      console.log(driver._id);
      CustomerOrder.find(
        {
          $and: [{ driver: driver._id }, { parcelStatus: "completed" }],
        },
        (err, parcel) => {
          if (!err) {
            res.json(parcel);
            console.log(parcel);
          } else {
            res.json(err);
          }
        }
      );
    }
  });
  //q1 end
});

// DRIVERS POST REQUEST ///////////////////////////
router.post("/drivers", isAuth, (req, res) => {
  Driver.findOne({ licenseNumber: req.body.licenseNumber }, (err, driver) => {
    if (err) {
      console.log(err);
      res.json(err);
    } else {
      if (driver == null) {
        const frontImg = req.files.frontImg;
        cloudinary.uploader.upload(frontImg.tempFilePath, (err, result) => {
          // console.log(result);

          const backImg = req.files.backImg;
          cloudinary.uploader.upload(backImg.tempFilePath, (err, result2) => {
            // console.log(result2);
            let uniqueId =
              req.user == undefined ? req.app.locals.userId._id : req.user._id;
            let userId = uniqueId;

            const driver = Driver({
              name: req.body.name,
              registrationNo: req.body.registrationNo,
              make: req.body.make,
              model: req.body.model,
              year: req.body.year,
              licenseNumber: req.body.licenseNumber,
              DrivingFor: req.body.DrivingFor,
              user: userId,
              licenseFrontImg: result.url,
              licenseBackImg: result2.url,
            });
            driver.save().then((driver) => {
              if (driver) {
                console.log(driver);
                res.json(driver);
                User.findOneAndUpdate(
                  { _id: uniqueId },
                  {
                    $set: {
                      userType: "driver",
                    },
                  },
                  { new: true },
                  (err, result) => {
                    if (err) {
                      console.log(err);
                    } else {
                      // console.log(result);
                      // console.log("successfully because email match");
                      // return res.send("");
                      console.log("userType set to driver");
                    }
                  }
                );
                //////////// redirecting route  //////////
                // res.redirect("/drivers/homepage");
              } else {
                // console.log(driver);
                res.send("registeraton failed");
              }
            });
          });
        });
      } else {
        res.json({
          message: "This Driving License is already in Use!",
        });
      }
    }
  });
});

// Completing parecl order request by driver
router.post("/drivers/deliveries/completed/:_id", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  Driver.findOneAndUpdate(
    { user: uniqueId },
    {
      $pull: { parcelsUnderway: req.params._id },
      $push: { parcelsCompleted: req.params._id },
    },
    { new: true },
    (err, driver) => {
      if (err) {
        console.log(err);
      } else {
        console.log(driver);
        //q2 start
        CustomerOrder.findOneAndUpdate(
          { _id: req.params._id },
          { $set: { parcelStatus: "completed" } },
          { new: true },
          (err, parcel) => {
            if (err) {
              console.log(err);
            } else {
              console.log(parcel);
            }
          }
        );
        //q2 end
      }
    }
  );
  //q1 end

  CustomerOrder.findOne({ _id: req.params._id }, async function (err, parcel) {
    if (!err) {
      ////  notification start
      const senderNotification = new Notification({
        receiverId: parcel.user,
        text: "Your sending Parcel to " + parcel.receiverName + " is Reached!",
      });

      try {
        const savedNotification = await senderNotification.save();
        // res.status(200).json(savedNotification);
        console.log(savedNotification);
      } catch (err) {
        // res.status(500).json(err);
        console.log(err);
      }

      ////  notification end
      const driverNotification = new Notification({
        receiverId: uniqueId,
        text:
          "Congratulations! You have successfully completed the delivery from " +
          parcel.senderName +
          " to " +
          parcel.receiverName +
          ".",
      });

      try {
        const savedDriverNotification = await driverNotification.save();
        // res.status(200).json(savedNotification);
        console.log(savedDriverNotification);
      } catch (err) {
        // res.status(500).json(err);
        console.log(err);
      }

      ////  notification end

      ////  notification start
      User.findOne(
        { username: parcel.receiverEmail },
        async function (err, user) {
          if (!err) {
            const receiverNotification = new Notification({
              receiverId: user._id,
              text:
                "Your Recieving Parcel from " +
                parcel.senderName +
                " is Reached!",
            });

            try {
              const saveReceiverNotification =
                await receiverNotification.save();
              // res.status(200).json(saveReceiverNotification);
              console.log(saveReceiverNotification);
            } catch (err) {
              // res.status(500).json(err);
              console.log(err);
            }

            ////  notification end
          } else {
            console.log(err);
          }
        }
      );
    } else {
      res.status(501).json(err);
    }
  });
});

module.exports = router;
