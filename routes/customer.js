const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const isAuth = require("../middleware/auth");
//Selecting Customer Category. and showing Customer posted orders both pending and underway

router.get("/customers", isAuth, function (req, res) {
  // res.send("Customer Home Page");

  // ********************************** alert ***************************************************************
  // ********************************** alert ***************************************************************
  // ********************************** alert ***************************************************************
  CustomerOrder.deleteMany({ paymentStatus: false }, (req, res) => {
    console.log("delted parcels with payment status false");
  });
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;

  CustomerOrder.find(
    { $and: [{ user: uniqueId }, { parcelStatus: { $ne: "completed" } }] },
    (err, foundOrders) => {
      if (!err) {
        console.log("paracels placed by customer");
        console.log(foundOrders);
      } else {
        console.log(err);
      }
    }
  );
});

//Selecting only those customer parcels which are underway

router.get("/customers/parcels-underway", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  res.send("Customer Home Page");
  CustomerOrder.find(
    { $and: [{ user: uniqueId }, { parcelStatus: "underway" }] },
    (err, foundOrders) => {
      if (!err) {
        console.log("Underway parcels of the customer");
        console.log(foundOrders);
      } else {
        console.log(err);
      }
    }
  );
});
//Receiving........
//Selecting only those customer parcels which are underway

router.get(
  "/customers/receiving-parcels/parcels-underway",
  isAuth,
  function (req, res) {
    let uniqueId =
      req.user == undefined ? req.app.locals.userId._id : req.user._id;
    // res.send("Customer Home Page");
    User.findOne({ _id: uniqueId }, function (err, user) {
      CustomerOrder.find(
        {
          $and: [
            { receiverEmail: user.username },
            { parcelStatus: { $ne: "completed" } },
          ],
        },
        (err, foundOrders) => {
          if (!err) {
            // console.log("Underway parcels of the customer");
            res.status(200).json(foundOrders);
          } else {
            console.log(err);
          }
        }
      );
    });
  }
);

// Receiver Review page...........
router.get("/customers/receiver-review/:_id", isAuth, function (req, res) {
  res.status(200).json("send driver review page");
});

//Selecting only those customer parcels which are completed
router.get("/customers/parcels-completed", isAuth, function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  res.send("Customer Home Page with completd parcels");
  CustomerOrder.find(
    { $and: [{ user: uniqueId }, { parcelStatus: "completed" }] },
    (err, foundOrders) => {
      if (!err) {
        console.log("Completed parcels of the customer");
        console.log(foundOrders);
      } else {
        console.log(err);
      }
    }
  );
});
//Receiving........
//Selecting only those customer parcels which are completed

router.get(
  "/customers/receiving-parcels/parcels-completed",
  isAuth,
  function (req, res) {
    let uniqueId =
      req.user == undefined ? req.app.locals.userId._id : req.user._id;
    // res.send("Customer Home Page");
    User.findOne({ _id: uniqueId }, function (err, user) {
      CustomerOrder.find(
        {
          $and: [
            { receiverEmail: user.username },
            { parcelStatus: "completed" },
          ],
        },
        (err, foundOrders) => {
          if (!err) {
            console.log("Underway parcels of the customer");
            // console.log(foundOrders);
            res.status(200).json(foundOrders);
          } else {
            console.log(err);
          }
        }
      );
    });
  }
);

// Customer Order placing page

router.get("/customers/orders", isAuth, function (req, res) {
  res.send("Send Order details form");
});

// ************* Updated Routes *************

router.post("/update/customer-profile/:id", function (req, res) {
  // let uniqueId =
  //   req.user == undefined ? req.app.locals.userId._id : req.user._id;

  User.findOne({ _id: req.params.id }, function (err, user) {
    if (!err) {
      try {
        // const userPicture = req.files.userPicture;
        // cloudinary.uploader.upload(userPicture.tempFilePath, (err, picture) => {

        if (user.username === req.body.username) {
          User.findOneAndUpdate(
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
                return res.status(200).json({ CustomerData: result });
              }
            }
          );
        } else {
          User.findOne({ username: req.body.username }, (err, foundUser) => {
            if (err) {
              res.status(400).json({ Error: err });
            } else {
              if (foundUser === null) {
                User.findOneAndUpdate(
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
                      return res.status(200).json({ CustomerData: result });
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

router.post("/update/customer-address/:id", function (req, res) {
  try {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) {
        return res.status(400).json({ Error: err });
      } else {
        User.findOneAndUpdate(
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
              res.status(200).json({ UpdatedData: result });
            }
          }
        );
      }
    });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

// ************* Updated Routes *************

//Receiver Review........
router.post("/customers/receiver-review/:_id", function (req, res) {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  //q1 start
  CustomerOrder.findOne({ _id: req.params._id }, (err, parcel) => {
    if (!err) {
      let c = 1;
      Driver.findOneAndUpdate(
        ///////////////////// check  /////////////////////////////
        { _id: parcel.driver },
        {
          // $set:{year:31},
          $push: {
            reviews: [
              {
                reviewerId: uniqueId,
                rating: req.body.rating,
                // review: req.body.review.length !== 0 && req.body.review,
                review: req.body.review,
              },
            ],
          },
        },
        // { $set: { paymentStatus: true } },
        { new: true },
        (err, result) => {
          console.log(result);
          res.send(result);
        }
      );
    } else {
      console.log(err);
    }
  }); //q1 end
});

router.post("/customers/post-parcel/:id", function (req, res) {
  var userId = req.params.id;
  const newOrder = CustomerOrder({
    senderName: req.body.senderName,
    receiverName: req.body.receiverName,
    receiverEmail: req.body.receiverEmail,
    pickupAddress: req.body.pickupAddress,
    destinationAddress: req.body.destinationAddress,
    size: req.body.size,
    offer: req.body.offer,
    message: req.body.message,
    sendingLocation: req.body.sendingLocation,
    user: userId,
  });
  req.app.set("newOrderId", newOrder._id);
  req.app.set("senderName", newOrder.senderName);
  newOrder
    .save()
    .then((order) => {
      if (order) {
        req.app.locals.ParcelPrice = order.offer;
        req.app.locals.ParcelId = order._id;
        res.status(200).json({ parcel: order, parcelId: order._id });
      } else {
        console.log("cannot post order");
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});
//DELETE PARCEL
router.delete("/customers/:_id", isAuth, async (req, res) => {
  try {
    await CustomerOrder.findByIdAndDelete(req.params._id);
    res.status(200).json("Parcel has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
