const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const flash = require("connect-flash");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const resizeImg = require("resize-img");

const Product = require("../models/product");
const Category = require("../models/category");

// GET products index
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    //res.json(products);
    res.render("admin/products", {
      messages: req.flash(),
      products: products,
    });
  } catch (e) {
    console.log(e);
  }
});

// GET add product
router.get("/add-product", async (req, res) => {
  const title = "";
  const desc = "";
  const price = "";

  const categories = await Category.find();

  res.render("admin/add_product", {
    title: title,
    desc: desc,
    price: price,
    categories: categories,
  });
});

// POST add product
router.post(
  "/add-product",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  body("desc").notEmpty(),
  body("price").isDecimal(),
  async (req, res) => {
    const errors = validationResult(req);
    const title = req.body.title;
    const slug = req.body.title.replace(/\s+/g, "-").toLowerCase();
    const price = req.body.price;
    const category = req.body.category;
    const desc = req.body.desc;
    const imageFile = req.files == null ? "" : req.files.image.name;
    if (!errors.isEmpty()) {
      const categories = await Category.find();

      res.render("admin/add_product", {
        errors: errors.array(),
        title: title,
        desc: desc,
        price: price,
        categories: categories,
      });
    } else {
      try {
        let product = await Product.findOne({ slug: slug });
        if (product) {
          console.log("slug already exists");
          req.flash("danger", "Product slug already exists, choose another");

          const categories = await Category.find();
          res.render("admin/add_product", {
            messages: req.flash(),
            title: title,
            desc: desc,
            price: price,
            categories: categories,
          });
        } else {
          product = new Product({
            title: title,
            slug: slug,
            desc: desc,
            price: parseFloat(price).toFixed(2),
            category: category,
            image: imageFile,
          });
          await product.save();

          mkdirp(`public/product_images/${product._id}/gallery/thumbs`)
            .then((made) => {
              if (imageFile != "") {
                const productImage = req.files.image;
                const path = `public/product_images/${product._id}/${imageFile}`;
                productImage.mv(path);
              }
            })
            .catch((e) => console.log(e));

          req.flash("success", "Product added!");
          res.redirect("/admin/products");
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// GET edit product
router.get("/edit-product/:id", async (req, res) => {
  try {
    let errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    const product = await Product.findById(req.params.id);
    const categories = await Category.find();
    const galleryDir = `public/product_images/${product._id}/gallery`;

    const galleryImages = await fs.readdir(galleryDir);

    res.render("admin/edit_product", {
      messages: req.flash(),
      errors: errors,
      title: product.title,
      desc: product.desc,
      price: parseFloat(product.price).toFixed(2),
      categories: categories,
      categorySelected: product.category.replace(/\s+/g, "-").toLowerCase(),
      image: product.image,
      galleryImages: galleryImages,
      id: product._id,
    });
  } catch (e) {
    console.log(e);
  }
});

// POST edit product
router.post(
  "/edit-product/:id",
  body("title")
    .isLength({ min: 5 })
    .withMessage("must be at least 5 chars long"),
  body("desc").notEmpty(),
  body("price").isDecimal(),
  async (req, res) => {
    const { errors } = validationResult(req);
    const title = req.body.title;
    const slug = req.body.title.replace(/\s+/g, "-").toLowerCase();
    const price = req.body.price;
    const category = req.body.category;
    const desc = req.body.desc;
    const imageFile = req.files == null ? "" : req.files.image.name;
    const pimage = req.body.pimage;
    const id = req.params.id;
    if (errors.length > 0) {
      req.session.errors = errors;
      res.redirect("/admin/products/edit-product/" + id);
    } else {
      try {
        let product = await Product.findOne({
          slug: slug,
          _id: { $ne: id },
        });

        if (product) {
          req.flash("danger", "Product title already exists, choose another");
          res.redirect("/admin/products/edit-product/" + id);
        } else {
          const updateFields = {
            title: title,
            slug: slug,
            desc: desc,
            price: parseFloat(price).toFixed(2),
            category: category,
          };
          if (imageFile != "") {
            updateFields.image = imageFile;
          }
          await Product.findByIdAndUpdate(id, updateFields);

          if (imageFile != "") {
            if (pimage != "") {
              fs.remove(`public/product_images/${id}/${pimage}`);
            }
            const productImage = req.files.image;
            const path = `public/product_images/${id}/${imageFile}`;
            productImage.mv(path);
          }
          req.flash("success", "Page updated!");
          res.redirect(`/admin/products/edit-product/${id}`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }
);

// Delete product
router.get("/delete-product/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const path = `public/product_images/${id}`;
    await fs.remove(path);

    const deleted = await Product.findByIdAndRemove(id);

    req.flash("success", "Product  deleted!");
    res.redirect(`/admin/products/`);
  } catch (e) {
    console.log(e);
  }
});

// Add gallery images
router.post("/product-gallery/:id", async (req, res) => {
  try {
    const productImage = req.files.file;
    const id = req.params.id;
    const path = `public/product_images/${id}/gallery/${req.files.file.name}`;
    const thumbsPath = `public/product_images/${id}/gallery/thumbs/${req.files.file.name}`;

    await productImage.mv(path);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then((buf) =>
      fs.writeFileSync(thumbsPath, buf)
    );
    req.flash("success", "Images added to gallery!");
    //res.redirect(`/admin/pages/`);
    res.sendStatus(200);
  } catch (e) {
    console.log(e);
  }
});

// delete gallery image

router.get("/delete-image/:image", async (req, res) => {
  const id = req.query.id;
  const imageName = req.params.image;
  const originalImage = `public/product_images/${id}/gallery/${imageName}`;
  const thumbImage = `public/product_images/${id}/gallery/thumbs/${imageName}`;
  try {
    await fs.remove(originalImage);
    await fs.remove(thumbImage);
    req.flash("success", "Images deleted!");
    res.redirect(`/admin/products/edit-product/${id}`);
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
