const express = require("express");
const router = express.Router();
const Page = require("../models/page");
const Joi = require("joi");
const { transporter } = require("../startup/nodemailer");

// Get homepage
router.get("/", (req, res) => {
  res.render("index", {});
});

router.get("/contact", (req, res) => {
  res.render("contact", {});
});

router.post("/contact", async (req, res) => {
  //Validate Body
  const schemaContact = Joi.object({
    name: Joi.string().required().messages({ "*": "Name is required" }),
    phone: Joi.string()
      .min(9)
      .required()
      .messages({ "*": "Valid Phone number is required" }),
    email: Joi.string()
      .email()
      .required()
      .messages({ "*": "Valid Email is required" }),
    message: Joi.string()
      .min(10)
      .required()
      .messages({ "*": "Valid Message is required" }),
  });

  try {
    const value = await schemaContact.validateAsync(req.body, {
      abortEarly: false, // include all errors
    });
  } catch (error) {
    console.log(error);
    const errors = error.details.map((x) => x.message).join("</br> ");
    req.flash("danger", errors);
    res.render("contact", {
      contactDetails: req.body,
      messages: req.flash(),
    });
  }

  // send Email to iEats admin
  try {
    const mailData = {
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "Customer Messaged you",
      html: `${req.body.name} sent the following message, <br/><br/>
      ${req.body.message} <br/><br/>
      ${req.body.email} ${req.body.phone} 
      `,
    };
    if (process.env.SENDEMAILS === "true") {
      transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
      });
    }
    // Redirect
    req.flash("success", "Message Sent");
    return res.redirect("back");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
