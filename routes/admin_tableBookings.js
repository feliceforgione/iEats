const express = require("express");
const router = express.Router();
const { TableBooking } = require("../models/tableBooking");
const { body, validationResult } = require("express-validator");

// Get booktable
router.get("/", async (req, res) => {
  try {
    const tableBookings = await TableBooking.find().sort({ dateRequested: -1 });

    res.render("admin/bookings", {
      tableBookings: tableBookings,
    });
  } catch (e) {
    console.log(e);
  }
});

// POST Booking
router.post("/", async (req, res) => {
  req.body.dateRequested = Date.parse(
    `${req.body.dateRequested} ${req.body.timeRequested}:00 GMT-04:00`
  );

  try {
    const newBooking = new tableBooking(req.body);
    const result = await newBooking.save();
    console.log(result);
    req.flash("success", "Table Reservation has been placed");
    return res.redirect("back");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
