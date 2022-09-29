const Page = require("../models/page");
const Category = require("../models/category");

const refreshPages = async (app) => {
  try {
    const pages = await Page.find({ slug: { $ne: "home" } }, "title slug");
    app.locals.pages = pages;
  } catch (e) {
    console.log(e);
  }
};

const refreshCategories = async (app) => {
  try {
    const categories = await Category.find({});
    app.locals.categories = categories;
  } catch (e) {
    console.log(e);
  }
};

const initalize = (app) => {
  app.locals.pages = null;
  refreshCategories(app);
};

module.exports = { initalize, refreshPages, refreshCategories };
