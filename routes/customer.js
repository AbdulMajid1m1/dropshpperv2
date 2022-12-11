const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const isAuth = require("../middleware/auth");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const BaseUrl = "http://localhost:3000";
//Selecting Customer Category. and showing Customer posted orders both pending and underway
router.get("/home/customers/:id", function (req, res) {
  // CustomerOrder.deleteMany({ paymentStatus: false }, (req, res) => {
  //   console.log("delted parcels with payment status false");
  // });
  // CustomerOrder.deleteMany({ paymentStatus: false })
  //   .then(function () {
  //     console.log("delted parcels with payment status false"); // Success
  //   })
  //   .catch(function (error) {
  //     console.log(error); // Failure
  //   });
  CustomerOrder.find(
    { $and: [{ user: req.params.id }, { parcelStatus: { $ne: "completed" } }] },
    (err, foundOrders) => {
      if (!err) {
        // console.log("paracels placed by customer");
        // console.log(foundOrders);
        res.status(200).json({ AllParcels: foundOrders });
      } else {
        res.status(500).json({ error: err });
      }
    }
  );
});

/////  GET Customer DATA START /////////////
router.get("/get-customer-data/:id", function (req, res) {
  User.findOne({ _id: req.params.id }, function (err, user) {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      res.status(200).json({ CustomerData: user });
    }
  });
});
/////  GET Customer DATA END /////////////

//Selecting only those customer parcels which are underway

router.get("/home/customers/parcels-underway/:id", function (req, res) {
  CustomerOrder.find(
    { $and: [{ user: req.params.id }, { parcelStatus: "underway" }] },
    (err, foundOrders) => {
      if (!err) {
        res.status(200).json({ AllParcels: foundOrders });
      } else {
        res.status(500).json({ error: err });
      }
    }
  );
});
//Receiving........
//Selecting only those customer parcels which are underway

router.get(
  "/home/customers/receiving-parcels/parcels-underway/:id",
  function (req, res) {
    User.findOne({ _id: req.params.id }, function (err, user) {
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
            res.status(200).json({ AllParcels: foundOrders });
          } else {
            res.status(500).json({ error: err });
          }
        }
      );
    });
  }
);

// Receiver Review page...........
router.get("/customers/receiver-review/:_id", function (req, res) {
  res.status(200).json("send driver review page");
});

//Selecting only those customer parcels which are completed
router.get("/home/customers/parcels-completed/:id", function (req, res) {
  CustomerOrder.find(
    { $and: [{ user: req.params.id }, { parcelStatus: "completed" }] },
    (err, foundOrders) => {
      if (!err) {
        res.status(200).json({ AllParcels: foundOrders });
      } else {
        res.status(500).json({ error: err });
      }
    }
  );
});
//Receiving........
//Selecting only those customer parcels which are completed

router.get(
  "/home/customers/receiving-parcels/parcels-completed/:id",

  function (req, res) {
    User.findOne({ _id: req.params.id }, function (err, user) {
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
            res.status(200).json({ AllParcels: foundOrders });
          } else {
            res.status(500).json({ error: err });
          }
        }
      );
    });
  }
);

// ************* Updated Routes *************
router.post("/update/customer-profile/:id", function (req, res) {
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
              res.status(200).json({ CustomerData: result });
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
// Reciever accepting delivery parcels
router.post("/customer/recieve-delivery/:driverId/:parcelId", function (req, res) {
  Driver.findOneAndUpdate(
    { user: req.params.driverId },
    {
      $pull: { parcelsUnderway: req.params.parcelId },
      $push: { parcelsCompleted: req.params.parcelId },
    },
    { new: true },
    (err, driver) => {
      if (err) {
        res.status(500).json({ error: err });
      } else {
        console.log(driver);
        CustomerOrder.findOneAndUpdate(
          { _id: req.params.parcelId },
          { $set: { parcelStatus: "completed" }, customerStatus: true },
          { new: true },
          (err, parcel) => {
            if (err) {
              res.status(500).json({ error: err });
            } else {
              res.status(500).json({ FoundParcel: parcel });
            }
          }
        );

      }
    }
  );


  CustomerOrder.findOne({ _id: req.params.parcelId }, async function (err, parcel) {
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
        receiverId: req.params.driverId,
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

//Receiver Review post route ........
router.post(
  "/customers/receiver-review/:user_id/:parcel_id",
  function (req, res) {
    //q1 start
    CustomerOrder.findOne({ _id: req.params.parcel_id }, (err, parcel) => {
      if (!err) {
        let c = 1;

        User.findOne({ _id: req.params.user_id }, (err, receiver) => {
          if (err) {
            res.status(500).json({ error: err })
          }
          else if (receiver !== null) {
            Driver.findOneAndUpdate(
              ///////////////////// check  /////////////////////////////
              { _id: parcel.driver },
              {
                // $set:{year:31},
                $push: {
                  reviews: [
                    {
                      reviewerId: req.params.user_id,
                      rating: req.body.rating,
                      // review: req.body.review.length !== 0 && req.body.review,
                      review: req.body.review,
                      reviewerName: receiver.fullName,
                      postedDate: Date.now(),
                    },
                  ],
                },
              },
              // { $set: { paymentStatus: true } },
              { new: true },
              (err, result) => {
                if (!err) {
                  res.status(200).json({ message: "success", driverData: result });
                } else {
                  res.status(500).json({ error: err });
                }
              }
            );
          }
          else {
            res.status(400).json({ error: "User id is not correct!" });
          }
        })

      } else {
        res.status(500).json({ error: err });
      }
    }); //q1 end
  }
);

router.post("/customers/post-parcel/:id", function (req, res) {
  var userId = req.params.id;
  const newOrder = CustomerOrder({
    senderName: req.body.senderName,
    receiverName: req.body.receiverName,
    receiverEmail: req.body.receiverEmail,
    pickupAddress: req.body.pickupAddress,
    destinationAddress: req.body.destinationAddress,
    size: req.body.size,
    receiverMobileNumber: req.body.receiverMobileNumber,
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
        // res.status(200).json({ parcel: order, parcelId: order._id });
        req.session.order1 = order;
        // res.redirect("/successs");
        res.status(200).json({ messsage: "success", parcelDelivery: order });

        // console.log(order);
      } else {
        console.log("cannot post order");
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});
router.get("/successs", async (req, res) => {
  res.send(req.session.order1);
});
//DELETE PARCEL
router.delete("/customers/:_id", async (req, res) => {
  try {
    await CustomerOrder.findByIdAndDelete(req.params._id);
    res.status(200).json("Parcel has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

/////////////// --------------  PAYMENT ---------- //////////////
// router.post("/payment/:id", async (req, res) => {
//   var userId = req.params.id;
//   const newOrder = CustomerOrder({
//     senderName: req.body.senderName,
//     receiverName: req.body.receiverName,
//     receiverEmail: req.body.receiverEmail,
//     pickupAddress: req.body.pickupAddress,
//     destinationAddress: req.body.destinationAddress,
//     size: req.body.size,
//     offer: req.body.offer,
//     message: req.body.message,
//     sendingLocation: req.body.sendingLocation,
//     user: userId,
//   });
//   req.app.set("newOrderId", newOrder._id);
//   req.app.set("senderName", newOrder.senderName);
//   newOrder
//     .save()
//     .then(async (order) => {
//       if (order) {
//         req.app.locals.ParcelPrice = order.offer;
//         req.app.locals.ParcelId = order._id;
//         // res.status(200).json({ parcel: order, parcelId: order._id });

//         console.log({ parcelData: order });
//       } else {
//         console.log("cannot post order");
//       }
//     })
//     .catch((err) => {
//       res.status(400).json({ error: err });
//     });

//   //   const { product } = req.body;
//   //   const { product } = req.body;
// });

// no use
router.post("/payment/:id", async (req, res) => {
  //   const { product } = req.body;
  //   const { product } = req.body;
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
    .then(async (order) => {
      if (order) {
        req.app.locals.ParcelPrice = order.offer;
        req.app.locals.ParcelId = order._id;
        // res.status(200).json({ parcel: order, parcelId: order._id });
        console.log(order);
        req.app.locals.parcelData = order;

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: req.body.name,
                  // images: [product.image],
                },
                //   unit_amount: product.amount * 100,
                unit_amount: req.body.offer * 100,
              },
              // quantity: product.quantity,
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: BaseUrl + "/payment-success",
          cancel_url: BaseUrl + "/payment-fail",
        });

        res.json({ id: session.id });
      } else {
        console.log("cannot post order");
      }
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

router.get("/payment-success", async (req, res) => {
  CustomerOrder.findOneAndUpdate(
    { _id: req.app.locals.parcelData._id },
    {
      $set: {
        paymentStatus: true,
      },
    },
    { new: true },
    (err, result) => {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        return res.status(200).json({ parcelData: result });
      }
    }
  );
});
router.get("/payment-payment-fail", async (req, res) => {
  res.json({ error: "try again" });
});
/////////////// --------------  PAYMENT ---------- //////////////

module.exports = router;
