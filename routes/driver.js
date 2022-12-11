const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const cloudinary = require("cloudinary").v2;

// --------------------- NEW API  START-------------------////

//////// --------------- POST REQUEST START -------------//////////////

router.post("/update/driver-profile/:id", function (req, res) {
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
                return res.status(200).json({ DriverData: result });
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
                      return res.status(200).json({ DriverData: result });
                    }
                  }
                );
              } else {
                res.send({ message: "This username already in use" });
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

router.post("/update/driver-address/:id", function (req, res) {
  Driver.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).json({ Error: err });
    } else {
      Driver.findOneAndUpdate(
        { _id: req.params.id },
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
            res.status(400).json({ Error: err });
          } else {
            res.status(200).json({ DriverData: result });
          }
        }
      );
    }
  });
});

//////////// ------------- driver License Info start ----------//////////////

router.post("/update/driver-license-info/:id", function (req, res) {
  Driver.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      return res.status(400).json({ Error: err });
    } else {
      Driver.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            NameOnLicense:
              req.body.NameOnLicense.length === 0
                ? user.NameOnLicense
                : req.body.NameOnLicense,
            registrationNo:
              req.body.registrationNo.length === 0
                ? user.registrationNo
                : req.body.registrationNo,
            make: req.body.make.length === 0 ? user.make : req.body.make,
            year: req.body.year.length === 0 ? user.year : req.body.year,
            licenseNumber:
              req.body.licenseNumber.length === 0
                ? user.licenseNumber
                : req.body.licenseNumber,
            DrivingFor:
              req.body.DrivingFor.length === 0
                ? user.DrivingFor
                : req.body.DrivingFor,
            Model: req.body.Model.length === 0 ? user.Model : req.body.Model,
          },
        },
        { new: true },
        (err, result) => {
          if (err) {
            res.status(400).json({ Error: err });
          } else {
            res.status(200).json({ DriverData: result });
          }
        }
      );
    }
  });
});
//////////// ------------- driver License Info end ----------//////////////
//////// --------------- POST REQUEST END -------------//////////////

// --------------------- NEW API END-------------------////
//Selecting Drivers Category.
// router.get("/drivers", isAuth, function (req, res) {
//   res.send("Drivers Registration Page");
// });

/////  GET DIVER DATA START /////////////
router.get("/get-driver-data/:id", function (req, res) {
  Driver.findOne({ _id: req.params.id }, function (err, user) {
    if (!err) {
      res.status(200).json({ DriverData: user, uuid: user._id });
    }
    if (err) {
      res.status(400).json({ error: err });
    }
  });
});
/////  GET DIVER DATA END /////////////

// Seach results from driver page
router.get("/drivers/search-parcel/:searchText", function (req, res) {
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
        // console.log(err);
        res.status(400).json({ error: err });
      } else {
        // res.send(parcels);
        res.status(200).json({ FoundParcels: parcels });
      }
    }
  ).sort({ createdAt: -1 });
});
router.get("/drivers/homepage/:id", function (req, res) {
  // let uniqueId =
  //   req.user == undefined ? req.app.locals.userId._id : req.user._id;
  // Business.find({ city : { $regex: city, $options: 'i' } }
  // Driver.findOne({ _id: { $regex: req.params.id, $options: 'i' } }, function (err, user) {
  // Driver.findO({ city : { $regex: city, $options: 'i' } }
  Driver.findOne({ _id: req.params.id }, function (err, user) {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      try {
        console.log("user city is " + user.city);
      } catch (error) {
        console.log(error);
      }

      //q2
      CustomerOrder.find(
        { $and: [{ pickupAddress: { $regex: user.city, $options: 'i' } }, { parcelStatus: "pending" }] },
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

                  // console.log(parcels);
                  // Send Driver Home page from here.
                  res.status(200).json({ FoundParcels: parcels });
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
router.get("/drivers/homepage/:_id", function (req, res) {
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
// router.get(
//   "/drivers/homepage/receive-payment/:_id",
//   function (req, res) {
//     res.send("Send payment receiving form for driver");
//   }
// );
// app.get("/drivers/deliveries", function (req, res) {
//   res.send("Delivered by driver undrway");
// })

// showing parcels to drivers which are underway
//////////////////////// Port Listening  /////////////////////////////
router.get("/drivers/deliveries/underway/:id", function (req, res) {
  // res.send("Send payment receiving form for driver");
  // let uniqueId =
  //   req.user == undefined ? req.app.locals.userId._id : req.user._id;
  //q1 start
  Driver.findOne({ user: req.params.id }, (err, driver) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      // console.log(driver._id);
      CustomerOrder.find(
        {
          $and: [{ driver: driver._id }, { parcelStatus: "underway" }],
        },
        (err, parcel) => {
          if (!err) {
            res.status(200).json({ FoundParcels: parcel });
          } else {
            res.status(400).json({ error: err });
          }
        }
      );
    }
  });
  //q1 end
});

router.get("/drivers/deliveries/completed/:id", function (req, res) {
  // res.send("Send payment receiving form for driver");
  //q1 start
  Driver.findOne({ user: req.params.id }, (err, driver) => {
    if (err) {
      res.status(500).json({ error: err });
    } else {
      // console.log("show ID");
      // console.log(driver._id);
      CustomerOrder.find(
        {
          $and: [{ driver: driver._id }, { parcelStatus: "completed" }],
        },
        (err, parcel) => {
          if (!err) {
            res.status(200).json({ FoundParcels: parcel });
          } else {
            res.status(500).json({ error: err });
          }
        }
      );
    }
  });
  //q1 end
});

// DRIVERS POST REQUEST ///////////////////////////
// router.post("/drivers", (req, res) => {
//   Driver.findOne({ licenseNumber: req.body.licenseNumber }, (err, driver) => {
//     if (err) {
//       res.status(400).json({ error: err });
//     } else {
//       if (driver == null) {
//         try {
//           const frontImg = req.files.frontImg;
//           cloudinary.uploader.upload(frontImg.tempFilePath, (err, result) => {
//             // console.log(result);

//             const backImg = req.files.backImg;
//             cloudinary.uploader.upload(backImg.tempFilePath, (err, result2) => {
//               // console.log(result2);
//               let uniqueId =
//                 req.user === undefined
//                   ? req.app.locals.userId._id
//                   : req.user._id;
//               let userId = uniqueId;

//               const driver = Driver({
//                 name: req.body.name,
//                 registrationNo: req.body.registrationNo,
//                 make: req.body.make,
//                 model: req.body.model,
//                 year: req.body.year,
//                 licenseNumber: req.body.licenseNumber,
//                 DrivingFor: req.body.DrivingFor,
//                 user: userId,
//                 licenseFrontImg: result.url,
//                 licenseBackImg: result2.url,
//               });
//               driver.save().then((driver) => {
//                 if (driver) {
//                   console.log(driver);
//                   res.status(200).json({ dtiverData: driver });
//                   User.findOneAndUpdate(
//                     { _id: uniqueId },
//                     {
//                       $set: {
//                         userType: "driver",
//                       },
//                     },
//                     { new: true },
//                     (err, result) => {
//                       if (err) {
//                         console.log(err);
//                       } else {
//                         // console.log(result);
//                         // console.log("successfully because email match");
//                         // return res.send("");
//                         console.log("userType set to driver");
//                       }
//                     }
//                   );
//                   //////////// redirecting route  //////////
//                   // res.redirect("/drivers/homepage");
//                 } else {
//                   // console.log(driver);
//                   res.send("registeraton failed");
//                 }
//               });
//             });
//           });
//         } catch (err) {
//           res.status(400).json({ error: err });
//         }
//       } else {
//         res.json({
//           message: "This Driving License is already in Use!",
//         });
//       }
//     }
//   });
//   // } catch (err) {
//   //   res.status(400).json({ error: "something went wrong" });
//   // }
// });

// Completing parecl order request by driver

router.post("/driver/request-delivery-completion/:driverId/:parcelId", function (req, res) {
  CustomerOrder.findOneAndUpdate(
    { _id: req.params.parcelId },
    { driverStatus: true },
    { new: true },
    (err, parcel) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        res.status(500).json({ FoundParcel: parcel });
      }
    }
  );

})


// FETCHING ALL REVIEWS ROUTE
router.get("/driver-reviews/:driverId", function (req, res) {
  Driver.findOne({ _id: req.params.driverId }, (err, driver) => {
    if (!err) {
      res.status(200).json({ Reviews: driver.reviews })
    }
    else {
      res.status(500).json({ error: err })
    }
  })
})




module.exports = router;
