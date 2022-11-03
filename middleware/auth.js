module.exports = function isAuth(req, res, next) {
  if (req.session.isAuth) {
    next();
  } else {
    // res.redirect("/login");
    res.status(404).json({err:"no data"})
  }
};
