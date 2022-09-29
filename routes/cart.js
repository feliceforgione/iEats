const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const Product = require("../models/product");
const Order = require("../models/order");
const flash = require("connect-flash");
const { TAXRATE } = require("../startup/appVariables");
const { isUser } = require("../startup/auth");

// Checkout page
router.get("/", function (req, res) {
  res.render("cart", {
    cart: req.session.cart,
    taxrate: TAXRATE,
  });
});

// Get add product to cart
router.get("/add/:product", async (req, res) => {
  try {
    const slug = req.params.product;
    const product = await Product.findOne({ slug: slug });

    //req.session.cart will hold the cart items
    if (req.session.cart == null) {
      req.session.cart = [];
      req.session.cart.push({
        title: product.title,
        foodID: product.slug,
        quantity: 1,
        price: parseFloat(product.price).toFixed(2),
      });
    } else {
      const index = req.session.cart.findIndex((item) => item.foodID == slug);
      if (index != -1) {
        req.session.cart[index].quantity++;
      } else {
        req.session.cart.push({
          title: product.title,
          foodID: product.slug,
          quantity: 1,
          price: parseFloat(product.price).toFixed(2),
        });
      }
    }

    req.flash("success", "Product added to cart");
    res.redirect("/menu");
  } catch (e) {
    console.log(e);
  }
});

// Checkout page
router.get("/checkout", isUser, async function (req, res) {
  //console.log(req.session.cart);
  //console.log(req.user);
  let total = req.session.cart.reduce(
    (acc, product) => product.price * product.quantity + acc,
    0
  );
  total = total * (1 + TAXRATE);

  const order = new Order({
    email: req.user._id,
    paymentStatus: "unpaid",
    status: "pending",
    total: parseFloat(total).toFixed(2),
    items: req.session.cart,
    billingAddress: req.user.billingAddress,
    shippingAddress: req.user.shippingAddress,
  });
  await order.save();
  delete req.session.cart;
  req.flash("success", "Order Placed");
  res.redirect("/users");
});

// Checkout cart update
router.get("/update/:product", function (req, res) {
  const product = req.params.product;
  const action = req.query.action;
  const index = req.session.cart.findIndex((item) => item.title == product);
  if (index === -1) {
    console.log("not found");
  } else {
    switch (action) {
      case "add":
        req.session.cart[index].quantity++;
        break;
      case "remove":
        req.session.cart[index].quantity--;
        if (req.session.cart[index].quantity < 1) {
          req.session.cart.splice(index, 1);
        }
        break;
      case "clear":
        req.session.cart.splice(index, 1);
        break;
      default:
        console("update issue");
        break;
    }
    if (req.session.cart.length == 0) delete req.session.cart;
  }
  req.flash("success", "Cart updated");
  res.redirect("back");
});

router.get("/clear", function (req, res) {
  delete req.session.cart;
  req.flash("success", "Cart cleared");
  res.redirect("/cart");
});

module.exports = router;
