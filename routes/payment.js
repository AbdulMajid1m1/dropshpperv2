const router = require("express").Router();
const User = require("../models/User");
const Driver = require("../models/Driver");
const CustomerOrder = require("../models/CustomerOrder");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const isAuth = require("../middleware/auth");

// Receving Payment using payment intent
router.get("/create-payment-intent", async (req, res) => {
  res.send("send page having stipe form here");
});
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

router.get("/api/stripe/account", async (req, res) => {
  const account = await stripe.accounts.create({
    type: "express",
  });
  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "http://localhost:3000/pay",
    return_url: "http://localhost:3000/pay",
    type: "account_onboarding",
  });
  // In case of request generated from the web app, redirect
  res.redirect(accountLinks.url);
});

// Sending Payment to dirver
router.post("/driver/receive-payment/:_id", async (req, res) => {
  let uniqueId =
    req.user == undefined ? req.app.locals.userId._id : req.user._id;
  CustomerOrder.findOne({ _id: req.params._id }, async (err, parcel) => {
    if (!err) {
      if (parcel.driverPayment === false && parcel.paymentStatus === true) {
        let price = parcel.offer * 100;
        try {
          const transfer = await stripe.transfers.create({
            amount: price,
            currency: "usd",
            // destination: "{{CONNECTED_STRIPE_ACCOUNT_ID}}",
            destination: req.body.accountId,
          });
          res
            .status(200)
            .json({ success: true, message: "payment successful" });
          //backend processes///////////
          //q1 start

          Driver.findOneAndUpdate(
            { user: uniqueId },
            { $push: { parcelsUnderway: req.params._id } },
            { new: true },
            (err, driver) => {
              if (err) {
                console.log(err);
              } else {
                console.log("show driver");
                console.log(driver);
                //q2 start
                CustomerOrder.findOneAndUpdate(
                  { _id: req.params._id },
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
                                members: [
                                  parcel.user.toString(),
                                  parcel.driver.toString(),
                                  user._id.toString(),
                                ],
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
                            } else {
                              const newConversation = new Conversation({
                                members: [
                                  parcel.user.toString(),
                                  parcel.driver.toString(),
                                ],
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
                          } else {
                            console.log(err);
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
            { _id: req.params._id },
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
                  receiverId: uniqueId,
                  text: "Your Picked Parcel from " + parcel.senderName + ".",
                });

                try {
                  const savedDriverNotification =
                    await driverNotification.save();
                  // res.status(200).json(savedNotification);
                  console.log(savedDriverNotification);
                } catch (err) {
                  // res.status(500).json(err);
                  console.log(err);
                }

                ////  notification end

                ////  notification start
                try {
                  User.findOne(
                    { username: parcel.receiverEmail },
                    async function (err, user) {
                      if (!err) {
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
                          console.log(err);
                        }

                        ////  notification end
                      } else {
                        console.log(err);
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
            "payment is sent already or customer has not paid for parcel till now",
        });
      }
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
