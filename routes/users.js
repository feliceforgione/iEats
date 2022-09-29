const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Order = require("../models/order");
const { body, validationResult } = require("express-validator");
const { isUser, isLoggedOut } = require("../startup/auth");
const { TAXRATE } = require("../startup/appVariables");

// Get profile
router.get("/", isUser, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user._id }).sort({ date: -1 });
    res.render("user", {
      orders: orders,
    });
  } catch (e) {
    console.log(e);
  }
});

// Update User Info Get
router.get("/update", isUser, (req, res) => {
  console.log(req.user);
  res.render("editUser", {});
});

// Update User Info Post
router.post("/update", isUser, async (req, res) => {
  const updatedInfo = req.body;
  try {
    const result = await User.findByIdAndUpdate(req.user._id, updatedInfo);
    req.flash("success", "You updated your account");
    res.redirect("/users/");
  } catch (error) {
    console.log(error);
  }
});

// Get order
router.get("/order", isUser, async (req, res) => {
  try {
    const orderNum = req.query.id;
    if (orderNum == null) {
      req.flash("danger", "Missing order number");
      return res.redirect("back");
    }
    const order = await Order.findById(orderNum);
    res.render("order", {
      order: order,
      taxrate: TAXRATE,
    });
  } catch (e) {
    console.log(e);
  }
});

// Get Register
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

// Register a new user
router.post("/register", isLoggedOut, async (req, res) => {
  let newUser = req.body;
  newUser._id = req.body.email;

  try {
    // Check if email already exists
    const user = await User.findOne({ _id: newUser._id });
    if (user) {
      req.flash("danger", "Email already in use");
      return res.redirect("/users/register");
    }

    // Hash Password
    newUser.password = await hashPassword(newUser.password);

    // Save User
    newUser = new User(newUser);
    const result = await newUser.save();
    console.log(`${result._id} account created`);
    req.flash("success", "You are now registered");
    res.redirect("/users/login");
  } catch (error) {
    console.log(error);
    res.redirect("/users/register");
  }
});

async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

// Get Login
router.get("/login", (req, res) => {
  if (res.locals.user) return res.redirect("/user");

  res.render("login", {
    title: "Log In",
  });
});

// Post Login
router.post("/login", (req, res, next) => {
  /*  console.log("session", req.session);
  console.log(req.flash());
  console.log(req.passport); */

  passport.authenticate("local", {
    successRedirect: "/users",
    failureRedirect: "/users/login",
    failureFlash: true,
    keepSessionInfo: true,
  })(req, res, next);
});

// Get Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    req.flash("success", "You are now logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
