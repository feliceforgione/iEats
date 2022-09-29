const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Order = require("../models/order");
const { body, validationResult } = require("express-validator");
const { isUser, isLoggedOut } = require("../startup/auth");
const { TAXRATE } = require("../startup/appVariables");

router.get("/", async (req, res) => {
  try {
    let orderStatus = req.query.status;
    orderStatus =
      orderStatus == null || orderStatus == "all"
        ? null
        : { status: orderStatus };
    const orders = await Order.find(orderStatus).limit(50).sort({
      date: -1,
    });

    const pendingCount = await Order.find({ status: "pending" }).count();
    const cookingCount = await Order.find({ status: "cooking" }).count();

    res.render("admin/orders", {
      orders: orders,
      pendingCount: pendingCount,
      cookingCount: cookingCount,
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/:orderNum", async (req, res) => {
  try {
    const action = req.query.action;
    let orderNum = req.params.orderNum;
    if (action == null) {
      const order = await Order.findById(orderNum);
      const customer = await User.findById(order.email);
      res.render("admin/order", {
        order: order,
        customer: customer,
        taxrate: TAXRATE,
      });
    } else if (action) {
      await Order.findByIdAndUpdate(orderNum, { status: action });
      res.redirect("back");
    }
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
