const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  date: { type: Date, default: Date.now },
  paymentStatus: { type: String },
  status: { type: String },
  total: { type: Number, required: true },
  items: [
    {
      foodID: { type: String, required: true },
      title: { type: String },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
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
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
