const mongoose = require("mongoose");

const PageSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
});

const Page = mongoose.model("Page", PageSchema);

module.exports = Page;
