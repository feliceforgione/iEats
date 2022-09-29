const Joi = require("joi");
const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  numPeople: { type: String, required: true },
  dateRequested: { type: Date, required: true },
  datePlaced: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const TableBooking = mongoose.model("TableBooking", tableSchema);

// Joi

const schemaTableBooking = Joi.object({
  name: Joi.string().required().messages({ "*": "Name is required" }),
  phone: Joi.string()
    .min(9)
    .required()
    .messages({ "*": "Valid Phone number is required" }),
  email: Joi.string()
    .email()
    .required()
    .messages({ "*": "Valid Email is required" }),
  numPeople: Joi.string()
    .required()
    .messages({ "*": "Number of People is required" }),
  dateRequested: Joi.date().messages({
    "date.base": "Date required",
  }),
  timeRequested: Joi.string().min(5).messages({ "*": "Valid Time required" }),
  datePlaced: Joi.date(),
  status: Joi.string(),
});

module.exports = { TableBooking, schemaTableBooking };
