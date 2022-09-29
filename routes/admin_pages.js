const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Page = require("../models/page");
const flash = require("connect-flash");
const navigationMenus = require("../startup/navigation");

// GET pages index
router.get("/", async (req, res) => {
  try {
    console.log("admin pages");
    const pages = await Page.find({});
    //res.json(pages);
    res.render("admin/pages", {
      messages: req.flash(),
      pages: pages,
    });
  } catch (e) {
    console.log(e);
  }
});

// GET add page
router.get("/add-page", (req, res) => {
  const title = "";
  const slug = "";
  const content = "";

  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content,
  });
});

// POST add page
router.post(
  "/add-page",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  body("slug")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars long"),
  async (req, res) => {
    const title = req.body.title;
    const errors = validationResult(req);
    let slug = req.body.slug;
    if (!errors.isEmpty()) {
      res.render("admin/add_page", {
        errors: errors.array(),
        title: req.body.title,
        slug: slug,
        content: req.body.content,
      });
    } else {
      try {
        let page = await Page.findOne({ slug: slug });
        if (page) {
          console.log("slug already exists");
          req.flash("danger", "Page slug already exists, choose another");
          res.render("admin/add_page", {
            title: req.body.title,
            slug: slug,
            content: req.body.content,
          });
        } else {
          page = new Page({
            title: req.body.title,
            slug: slug,
            content: req.body.content,
          });
          await page.save();
          navigationMenus.refreshPages(req.app);
          req.flash("success", "Page added!");
          res.redirect("/admin/pages");
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// GET edit page
router.get("/edit-page/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    res.render("admin/edit_page", {
      messages: req.flash(),
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id,
    });
  } catch (e) {
    console.log(e);
  }
});

// POST edit page
router.post(
  "/edit-page/:slug",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  body("slug")
    .isLength({ min: 3 })
    .withMessage("must be at least 3 chars long"),
  async (req, res) => {
    const errors = validationResult(req);
    let slug = req.body.slug;
    if (!errors.isEmpty()) {
      res.render("admin/edit_page", {
        errors: errors.array(),
        title: req.body.title,
        slug: slug,
        content: req.body.content,
        id: req.body.id,
      });
    } else {
      try {
        let page = await Page.findOne({
          slug: slug,
          _id: { $ne: req.body.id },
        });
        if (page) {
          console.log("slug already exists");
          req.flash("danger", "Page slug already exists, choose another");
          res.render("admin/edit_page", {
            title: req.body.title,
            slug: slug,
            content: req.body.content,
            id: req.body.id,
          });
        } else {
          await Page.findOneAndUpdate(
            { slug: slug },
            {
              title: req.body.title,
              slug: slug,
              content: req.body.content,
            }
          );
          navigationMenus.refreshPages(req.app);
          req.flash("success", "Page updated!");
          res.redirect(`/admin/pages/edit-page/${slug}`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// DELETE page
router.get("/delete-page/:id", async (req, res) => {
  try {
    const page = await Page.findByIdAndRemove(req.params.id);
    navigationMenus.refreshPages(req.app);
    req.flash("success", "Page deleted!");
    res.redirect(`/admin/pages/`);
  } catch (e) {
    console.log(e);
  }
});
module.exports = router;
