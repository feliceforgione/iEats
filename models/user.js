const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  billingAddress: {
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
  },
  shippingAddress: {
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
  },
  admin: { type: Boolean, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
