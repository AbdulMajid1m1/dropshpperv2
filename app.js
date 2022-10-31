//jshint esversion:6
require("dotenv").config();
var cookieSession = require("cookie-session");
const express = require("express");
var flash = require("connect-flash");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
// models
const CustomerOrder = require("./models/CustomerOrder");
const User = require("./models/User");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const { Connection } = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
//middleware
const isAuth = require("./middleware/auth");
// Cloudinary Connection
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const app = express();

//database connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
});

// session store
var store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  databaseName: "dropshpperDB",
  collection: "Sessions",
});

app.use(flash());
app.use(
  fileUpload({
    useTempFiles: true,
  })
);
app.use(bodyParser.json());

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "this is very secret key.",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 24 * 60 * 60 * 1000, // see below
    },
    store: store,
  })
);
app.use(passport.initialize());

// app.use(
//   cookieSession({
//     name: "MyAppName",
//     keys: ["very secret key"],
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//     // maxAge:1000, // 30 days
//   })
// );

app.use(passport.session());

//
app.use(express.static("public"));

//
//////// Routes
app.use("/", require("./routes/password-reset"));
app.use("/", require("./routes/driver"));
app.use("/", require("./routes/introduction"));
app.use("/", require("./routes/profile"));
app.use("/", require("./routes/customer"));
app.use("/", require("./routes/payment"));
app.use("/conversations", conversationRoute);
app.use("/messages", messageRoute);

store.on("error", function (error) {
  console.log(error);
});

// mongoose.set("useCreateIndex", true);
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

//Google auth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/catogeries",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        {
          username: profile.emails[0].value,
          fullName: profile.displayName,
          googleId: profile.id,
        },
        function (err, user) {
          // app.set("userid", user._id);
          return cb(err, user);
        }
      );
    }
  )
);
// facebook auth
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/catogeries",
      profileFields: [
        "email",
        "id",
        "first_name",
        "gender",
        "last_name",
        "picture",
      ],
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate(
        {
          username:
            profile.username !== undefined ? profile.username : profile.id,
          fullName: profile.name.givenName + " " + profile.name.familyName,
          facebookId: profile.id,
        },
        function (err, user) {
          app.set("myvar", user._id);
          return cb(err, user);
        }
      );
    }
  )
);

////////////////  GET REQUESTS //////////////////

//scokets
app.get("/chat", (req, res) => {
  res.sendFile(__dirname + "/chat.html");
});

app.get("/login-register-page", function (req, res) {
  // Send login and register options page to user
  res.send("login and register options page");
});

// Google auth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/catogeries",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to Category Section.
    // res.redirect("/categories");
    res.send(req.user);
    // req.app.locals
    req.app.locals.userId = req.user;
    // res.send("Select category: Driver or Customer");
  }
);

//Facebook authentication

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/catogeries",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    // res.redirect('/catogeries');
    res.send(req.user);
    req.app.locals.userId = req.user;
    // res.send("<h1>Select category: Driver or Customer</h1>");
  }
);

app.get("/login", function (req, res) {
  // res.send("Login page");
  res.send({ success: true, Message: "Login TO continue" });
});

app.get("/register", function (req, res) {
  res.json("Resister page");
});

// Sending a category page to user for selecting a category (driver or customer)
app.get("/categories", isAuth, function (req, res) {
  res.send("category page");
});

// LOG OUT
app.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) throw err;
    });
    delete req.app.locals.userId;
    res.send("logout successful");
    // res.redirect("/");
    //Redirect to home page
  });
});
// Register Route
app.post("/register", function (req, res) {
  User.register(
    {
      username: req.body.username,

      fullName: req.body.fullName,
      mobileNumber: req.body.mobileNumber,
    },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          user.save();
          console.log(user._id);

          // res.redirect("/catogeries");
          // res.json(user);
          req.session.isAuth = true;
          res.send({ success: true, Token: req.session.id });
        });
      }
    }
  );
});
//Login Route
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        // res.redirect("/catogeries");
        // app.set("myvar", user._id);
        console.log(req.user._id);
        User.findOne({ _id: req.user._id }, function (err, user) {
          if (!err) {
            if (user.userType === "driver") {
              console.log("send drivers home page");
            } else if (user.userType === "customer") {
              console.log("send customers home page");
            } else {
              console.log("send categories home page");
            }
          }
        });
        req.session.isAuth = true;
        // res.send("<h1>You are LogedIn!</h1>");
        // res.redirect("/checkk");
        res.send({ success: true, Token: req.session.id });
      });
    }
  });
});

///////////////////////////// ****Only for testing**** ///////////////////////////////////////////////////////////

app.get("/pay", (req, res) => {
  res.sendFile(__dirname + "/public/checkout.html");
});
app.get("/log", (req, res) => {
  res.sendFile(__dirname + "/loggedin.html");
});
app.get("/checkk", (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.session.id);
    res.send("logged innn");
  } else {
    res.send("not logged in login first");
  }
  // res.json(req.user)
  // req.app.locals.userId = req.user.fullName;
  // let name=req.user.fullName;
  // res.send(name);
  // res.send(req.app.locals.userId);
  //   if(req.user!==null){
  //   res.sendFile(__dirname + "/loggedin.html");
  // }
  //   else{  res.sendFile(__dirname + "/nouser.html");

  //   }
});

///////////////////////////////////////// ___SERVER PORT___////////////////////////
const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server started on ${port}`);
});
