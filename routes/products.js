const express = require("express");
const router = express.Router();
const fs = require("fs-extra");
const Product = require("../models/product");
const { isUser } = require("../startup/auth");
const flash = require("connect-flash");

// Get products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("menu", {
      products: products,
    });
  } catch (e) {
    console.log(e);
  }
});

// Get product details
router.get("/:product", async (req, res) => {
  try {
    const productSlug = req.params.product;
    let galleryImages = null;

    const product = await Product.findOne({ slug: productSlug });

    const galleryDir = `public/product_images/${product._id}/gallery`;
    const files = await fs.readdir(galleryDir);
    galleryImages = files;

    res.render("product", {
      product: product,
      galleryImages: galleryImages,
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
