const router = require("express").Router();
const isAuth = require("../middleware/auth");

router.get("/", isAuth, function (req, res) {
  // send language page at root route
  res.send("language page");
});
router.get("/titles/first", isAuth, function (req, res) {
  // sending into pages about router
  res.send("First title page");
});
router.get("/titles/second", isAuth, function (req, res) {
  // sending into pages about router
  res.send("second title page");
});
router.get("/titles/third", isAuth, function (req, res) {
  // sending into pages about router
  res.send("third title page");
});
router.get("/titles/fourth", isAuth, function (req, res) {
  // sending into pages about app
  res.send("fourth title page");
});

router.get("/terms", isAuth, function (req, res) {
  // Send terms and conditon page
  res.send("terms page");
});
module.exports = router;
