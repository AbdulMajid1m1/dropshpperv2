const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const isAuth = require("../middleware/auth");
// const BaseUrl = "http://dropshpper-env.eba-vxawe2k2.us-east-1.elasticbeanstalk.com";
const BaseUrl = "http://localhost:3000";
// Receving Payment using payment intent
// router.get(`${BaseUrl}/hello`, async (req, res) => {
//   res.send("send page having stipe form here");
// });
router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    // amount: calculateOrderAmount(items),

    amount: req.app.locals.ParcelPrice * 100,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    // application_fee_amount: 123,
    // transfer_data: {
    //   // destination: "{{CONNECTED_ACCOUNT_ID}}",
    //   destination: "acct_1LbLfxGf2VnFVQXh",
    // },
  });
  CustomerOrder.findOneAndUpdate(
    { _id: req.app.locals.ParcelId },
    { $set: { paymentStatus: true } },
    { new: true },
    (err, result) => {
      // console.log(result);
    }
  );

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

router.get("/api/stripe/account/:driverId/:parcelId", async (req, res) => {
  Driver.findOne({ _id: req.params.driverId }, async (err, driver) => {
    if (err) {
      res.status(500).json({ error: err })
    } else {
      if (driver.AccountId.length === 0) {
        const account = await stripe.accounts.create({
          type: "express",
        });
        // console.log(account);
        // const saveAccountId
        req.session.accountId = account.id;
        const accountLinks = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: BaseUrl + "/onbording-failure",
          // return_url: BaseUrl + "/driver/receive-payment/" + req.params.driverId + "/" + req.params.parcelId,
          return_url: BaseUrl + "/driver/stripe-account-id/" + req.params.driverId + "/" + req.params.parcelId,
          type: "account_onboarding",
        });
        // In case of request generated from the web app, redirect
        res.redirect(accountLinks.url);
      } else {
        res.redirect(BaseUrl + "/driver/receive-payment/" + req.params.driverId + "/" + req.params.parcelId)
      }

    }
  })


});

router.get("/driver/stripe-account-id/:driverId/:parcelId", async (req, res) => {
  Driver.findOneAndUpdate(
    { _id: req.params.driverId },
    { $set: { AccountId: req.session.accountId } },
    { new: true },
    (err, result) => {
      if (!err) {
        console.log(result);
        res.redirect("/driver/receive-payment/" + req.params.driverId + "/" + req.params.parcelId);
      } else {
        res.status(500).json({ error: err })
      }
    }
  );

})


// Sending Payment to dirver
router.get("/checkkk/:id", (req, res) => {
  CustomerOrder.findOne({ _id: req.params.id }, (err, user) => {
    if (!err) {
      res.json({ user1: user })
    }
    else {

    }
  })
})
router.get("/onbording-failure", async (req, res) => {
  res.status(500).json({ error: "something went wrong!" })
})
router.get("/driver/receive-payment/:driverId/:parcelId", async (req, res) => {
  // let uniqueId =
  //   req.user == undefined ? req.app.locals.userId._id : req.user._id;
  CustomerOrder.findOne({ _id: req.params.parcelId }, async (err, parcel) => {
    if (err) {
      res.status(500).json({ error: err });
    }
    else if (parcel !== null) {

      if (parcel.driverPayment === false) {
        let price = parcel.offer * 100;
        try {
          Driver.findOne({ _id: req.params.driverId }, async (err, driver) => {
            if (err) {
              console.log({ error: err });

            } else {

              const transfer = await stripe.transfers.create({
                amount: price,
                currency: "usd",
                // destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
                destination: driver.AccountId,
              });
              res
                .status(200)
                .json({ success: true, message: "payment successful" });
            }
            //q1 start

            Driver.findOneAndUpdate(
              { _id: req.params.driverId },
              { $push: { parcelsUnderway: req.params.parcelId } },
              { new: true },
              (err, driver) => {
                if (err) {
                  console.log(err);
                } else {
                  console.log("show driver");
                  console.log(driver);
                  //q2 start
                  CustomerOrder.findOneAndUpdate(
                    { _id: req.params.parcelId },
                    {
                      $set: {
                        driverPayment: true,
                        driver: driver._id,
                        parcelStatus: "underway",
                      },
                    },
                    { new: true },
                    async (err, parcel) => {
                      if (err) {
                        console.log(err);
                      } else {
                        User.findOne(
                          { username: parcel.receiverEmail },
                          async function (err, user) {
                            if (!err) {
                              if (user !== null) {
                                const newConversation = new Conversation({
                                  parcelId: req.params._id,
                                  members: {
                                    senderId: parcel.user.toString(),
                                    driverId: parcel.driver.toString(),
                                    receiverId: user._id.toString(),
                                  },
                                });

                                try {
                                  const savedConversation =
                                    await newConversation.save();
                                  // res.status(200).json(savedConversation);
                                  console.log("conversation" + savedConversation);
                                } catch (err) {
                                  // res.status(500).json(err);
                                  console.log(err);
                                }
                              } else {
                                const newConversation = new Conversation({
                                  members: {
                                    senderId: parcel.user.toString(),
                                    driverId: parcel.driver.toString(),
                                  },
                                });

                                try {
                                  const savedConversation =
                                    await newConversation.save();
                                  // res.status(200).json(savedConversation);
                                  console.log(savedConversation);
                                } catch (err) {
                                  // res.status(500).json(err);
                                  console.log(err);
                                }
                              }

                              ////  notification end
                            }
                            else if (err) {
                              console.log(err)
                            }
                            else {
                              console.log("Reciever Email does not exit!");
                            }
                          }
                        );
                      }
                    }
                  );
                  //q2 end
                }
              }
            );
            //q1 end
            CustomerOrder.findOne(
              { _id: req.params.parcelId },
              async function (err, parcel) {
                if (!err) {
                  ////  notification start
                  const senderNotification = new Notification({
                    receiverId: parcel.user,
                    text:
                      "Your sending Parcel to " +
                      parcel.receiverName +
                      " on the way!",
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
                  ////  notification start
                  const driverNotification = new Notification({
                    receiverId: req.params.driverId,
                    text: "Your Picked Parcel from " + parcel.senderName + ".",
                  });

                  try {
                    const savedDriverNotification =
                      await driverNotification.save();
                    // res.status(200).json(savedNotification);
                    console.log(savedDriverNotification);
                  } catch (err) {
                    // res.status(500).json(err);
                    console.log("notifiacition side" + err);
                  }

                  ////  notification end

                  ////  notification start
                  try {
                    User.findOne(
                      { username: parcel.receiverEmail },
                      async function (err, user) {
                        if (user) {
                          const receiverNotification = new Notification({
                            receiverId: user._id,
                            text:
                              "Your Recieving Parcel from " +
                              parcel.senderName +
                              " is on the way!",
                          });

                          try {
                            const saveReceiverNotification =
                              await receiverNotification.save();
                            // res.status(200).json(saveReceiverNotification);
                            console.log(saveReceiverNotification);
                          } catch (err) {
                            // res.status(500).json(err);
                            console.log("notifiacition side" + err);
                          }

                          ////  notification end
                        } else {
                          console.log("Resiver Email side" + err);
                        }
                      }
                    );
                  } catch (err) {
                    console.log("receiver is not an app member");
                    console.log(err);
                  }
                } else {
                  res.status(501).json(err);
                }
              }
            );
          });




          ////////////-------////////////////
        } catch (err) {
          res.status(404).json({
            err: err.message,
            message: "sent create link account button here",
          });
        }
      } else {
        res.status(404).json({
          success: false,
          message:
            "payment is sent already!",
        });
      }
    }
    else {
      res.status(400).json({ message: "something went wrong!" });
    }
  });
});

module.exports = router;
