const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "send.one.com",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAILPASS,
  },
  secure: true,
});
module.exports = { transporter };
