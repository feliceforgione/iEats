const Joi = require("joi");
const express = require("express");
const router = express.Router();
const { TableBooking, schemaTableBooking } = require("../models/tableBooking");
const { body, validationResult } = require("express-validator");
const { transporter } = require("../startup/nodemailer");

// Get Booking
router.get("/", (req, res) => {
  res.render("booktable", { bookingDetails: req.body, flash: req.flash() });
});

// Post Booking
router.post("/", async (req, res) => {
  //Validate Body
  try {
    const value = await schemaTableBooking.validateAsync(req.body, {
      abortEarly: false, // include all errors
    });
    req.body.dateRequested = new Date(
      `${req.body.dateRequested}T${req.body.timeRequested}:00`
    );
    Joi.attempt(
      req.body.dateRequested,
      Joi.date().min("now").messages({
        "date.base": "Date invalid",
        "date.min": "Date/time has already passed",
      })
    );
  } catch (error) {
    console.log(error);
    const errors = error.details.map((x) => x.message).join("</br> ");
    req.flash("danger", errors);
    res.render("booktable", {
      bookingDetails: req.body,
      messages: req.flash(),
    });
  }

  // Save and Email Booking
  try {
    // Save Booking
    const newBooking = new TableBooking(req.body);
    const result = await newBooking.save();

    //Send Confirmation Email
    const mailData = {
      from: process.env.EMAIL,
      to: req.body.email,
      subject: "Table Reservation Placed",
      html: `Greetings ${req.body.name}, <br/><br/>
      Your table reservation for ${req.body.numPeople} people on ${new Date(
        req.body.dateRequested
      ).toLocaleString()}  has been placed. You will receive a phone call to confirm the reservation. <br/> <br/> See you soon, <br> iEats<br/>`,
    };
    if (process.env.SENDEMAILS === "true") {
      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
    }
    // Redirect
    req.flash("success", "Table Reservation has been placed");
    return res.redirect("back");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
