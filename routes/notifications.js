


const router = require("express").Router();
const Notification = require("../models/Notification");

////////////////// ------ NOTIFICATION ROUTES ------- ///////
router.get("/notifications/:id", async (req, res) => {
    Notification.find({ receiverId: req.params.id }, (err, result) => {
        if (!err) {
            res.status(200).json({ Notifications: result })
        }
        else {
            res.status(500).json({ erro: err });
        }
    })
})
////////////////// ------ NOTIFICATION ROUTE ------- ///////

module.exports = router;
