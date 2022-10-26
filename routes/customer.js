const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const isAuth = require("../middleware/auth");
//Selecting Customer Category. and showing Customer posted orders both pending and underway

router.get("/customers", isAuth, function (req, res) {
  res.send("Customer Home Page");
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

//Receiver Review........
router.post("/customers/receiver-review/:_id", isAuth, function (req, res) {
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

router.post("/customers/orders", isAuth, function (req, res) {
  // let userId = req.flash("userId");
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  var userId = uniqueId;
  // console.log("hurraa!!!!");
  // console.log(config);

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
  newOrder.save().then((order) => {
    if (order) {
      User.findOneAndUpdate(
        { _id: uniqueId },
        {
          $set: {
            userType: "customer",
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
            console.log("userType set to customer");
          }
        }
      );
      // console.log(order);
      // res.status(200).json(order);
      req.app.locals.ParcelPrice = order.offer;
      req.app.locals.ParcelId = order._id;
      // res.redirect("/create-payment-intent");
      res.status(200).json({ parcel: order, parcelId: order._id });

      // res.json(err);
    } else {
      console.log("cannot post order");
    }
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
