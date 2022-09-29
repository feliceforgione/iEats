const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const flash = require("connect-flash");
const navigationMenus = require("../startup/navigation");
const { isAdmin } = require("../startup/auth");

// GET categories index
router.get("/", isAdmin, async (req, res) => {
  try {
    const categories = await Category.find({});
    res.render("admin/categories", {
      messages: req.flash(),
      categories: categories,
    });
  } catch (e) {
    console.log(e);
  }
});

// GET add category
router.get("/add-category", (req, res) => {
  const title = "";
  res.render("admin/add_category", {
    title: title,
  });
});

// POST add category
router.post(
  "/add-category",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  async (req, res) => {
    const title = req.body.title;
    const slug = title.replace(/\s+/g, "-").toLowerCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("admin/add_category", {
        messages: req.flash(),
        errors: errors.array(),
        title: req.body.title,
      });
    } else {
      try {
        let category = await Category.findOne({ slug: slug });
        if (category) {
          console.log("category already exists");
          req.flash("danger", "Category already exists, choose another");
          res.render("admin/add_category", {
            title: req.body.title,
          });
        } else {
          category = new Category({
            title: req.body.title,
            slug: slug,
          });
          await category.save();
          navigationMenus.refreshCategories(req.app);
          req.flash("success", "Category added!");
          res.redirect("/admin/categories");
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// GET edit category
router.get("/edit-category/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.render("admin/edit_category", {
      messages: req.flash(),
      title: category.title,
      id: category._id,
    });
  } catch (e) {
    console.log(e);
  }
});

// POST edit category
router.post(
  "/edit-category/:id",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  async (req, res) => {
    const errors = validationResult(req);
    const slug = req.body.title.replace(/\s+/g, "-").toLowerCase();
    const id = req.params.id;
    if (!errors.isEmpty()) {
      res.render("admin/edit_category", {
        messages: req.flash(),
        errors: errors.array(),
        title: req.body.title,
        id: id,
      });
    } else {
      try {
        let category = await Category.findOne({
          slug: slug,
          _id: { $ne: id },
        });
        if (category) {
          console.log("slug already exists");
          req.flash("danger", "Category slug already exists, choose another");
          res.render("admin/edit_category", {
            title: req.body.title,
            id: id,
          });
        } else {
          await Category.findByIdAndUpdate(id, {
            title: req.body.title,
            slug: slug,
          });
          navigationMenus.refreshCategories(req.app);
          req.flash("success", "Category updated!");
          res.redirect(`/admin/categories/edit-category/${id}`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// DELETE page
router.get("/delete-category/:id", async (req, res) => {
  try {
    const page = await Category.findByIdAndRemove(req.params.id);
    navigationMenus.refreshCategories(req.app);
    req.flash("success", "Category deleted!");
    res.redirect(`/admin/categories/`);
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
