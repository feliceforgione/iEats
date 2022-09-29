const express = require("express");
const path = require("path");
require("dotenv").config();
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");
const passport = require("passport");
const Joi = require("joi");

const app = express();
const PORT = 3000;

// Connect to MongoDB
require("./startup/db");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Set global errors variable
app.locals.errors = null; // saves validation errors to display on page
app.locals.cart = [];

// Initialize front end navigation
require("./startup/navigation").initalize(app);

app.use(express.static("public"));
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());

// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = req.flash();
  next();
});

// Passport middleware
require("./startup/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

//Cart Middleware
app.get("*", (req, res, next) => {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});

//Set Routes
const users = require("./routes/users");
const pages = require("./routes/pages");
const adminPages = require("./routes/admin_pages");
const adminCategories = require("./routes/admin_categories");
const adminProducts = require("./routes/admin_products");
const adminOrders = require("./routes/admin_orders");
const products = require("./routes/products");
const tableBookings = require("./routes/tableBookings");
const adminTableBookings = require("./routes/admin_tableBookings");
const cart = require("./routes/cart");

app.use("/users", users);
app.use("/menu", products);
app.use("/cart", cart);
app.use("/booktable", tableBookings);
app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/admin/orders", adminOrders);
app.use("/admin/bookings", adminTableBookings);

app.use("/", pages);

app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
