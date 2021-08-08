const express = require("express");
const Product = require("./../../models/admin/product");
const auth = require("./../../middlewares/auth");
const Category = require("./../../models/admin/category");
const logger = require("./../../config/logger");
const pagination = require("./../../middlewares/pagination");

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
  countries,
  names,
  starWars,
} = require("unique-names-generator");

const router = express.Router();

router.get("/id/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new Error("Something went wrong!!");
    }

    res.send({ status: true, data: product });
  } catch (err) {
    logger.error(err);
    if (err.code == 11000) {
      res.status(400).send({
        status: false,
        message: "Can't add this product as this product already exists",
      });
    }
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/add", auth, async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      created_by: req.user.id,
    });

    if (!product) {
      throw new Error("Something went wrong!!");
    }

    res.send({ status: true, data: product });
  } catch (err) {
    logger.error(err);
    if (err.code == 11000) {
      res.status(400).send({
        status: false,
        message: "Can't add this product as this product already exists",
      });
    }
    res.status(400).send({ status: false, message: err.message });
  }
});

router.get("/list", auth, pagination(Product), async (req, res) => {
  try {
    const products = res.paginatedResult;
    if (!products) {
      throw new Error("Something went wrong!!");
    }

    const product_list = await JSON.parse(JSON.stringify(products));

    if (product_list.results.length > 0) {
      const cateogries = await Category.find();
      product_list.results.forEach((product, index) => {
        const category_index = cateogries.findIndex(
          (cat) => cat.id === product.category
        );
        if (category_index > -1) {
          const category = cateogries[category_index];
          product.category = category.category_name;
          product.categoryId = category_index;
          if (category.subcategory_list.length > 0) {
            const subcategory = category.subcategory_list.find(
              (subcat) => subcat._id == product.sub_category
            );
            product.sub_category = subcategory.subcategory;
            product.sub_categoryId = subcategory.id;
          }
        }
      });
    }

    res.send({ status: true, data: product_list });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/delete", auth, async (req, res) => {
  try {
    const _id = req.body.id;
    if (!_id) {
      throw new Error("id is required");
    }

    const del = await Product.deleteOne({ _id });

    if (del && del.deletedCount > 0) {
      res.send({ status: true, data: "product deleted successfully" });
    } else {
      throw new Error("Product does not exist");
    }
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    const _id = req.body.id;

    if (!_id) {
      throw new Error("id is required");
    }

    if (Object.keys(req.body).length < 2) {
      throw new Error("At least one field is required to update");
    }

    const product = await Product.findOne({ _id });

    if (!product) {
      throw new Error("Product does not exist");
    }

    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        product[key] = req.body[key];
      }
    }
    product.save();

    res.send({ status: true, data: product });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, message: err.message });
  }
});

router.get("/populate", auth, async (req, res) => {
  try {
    const cateogries = await Category.find();
    const limit = req.query.limit || 1;

    const brand = uniqueNamesGenerator({
      dictionaries: [animals],
      length: 1,
    });
    for (let i = 1; i <= limit; i++) {
      cateogries.forEach((category, i) => {
        category.subcategory_list.forEach(async (subcategory, index) => {
          const productObj = {
            name: uniqueNamesGenerator({
              dictionaries: [
                adjectives,
                colors,
                animals,
                countries,
                starWars,
                names,
              ],
              length: 6,
            })
              .split("_")
              .join(" "),
            category: category.id,
            sub_category: subcategory.id,
            brand,
            price: Math.floor(Math.random() * (999 - 100 + 1) + 100),
            quantity: Math.floor(Math.random() * (99 - 10 + 1) + 10),
            specification:
              "If you are a travel blogger, gamer, entertainment seeker, or a person who loves a high-end personal device, then the Redmi 8 has been created to meet your needs. This smartphone features a 15.8-cm (6.22) Dot Notch Display, a 12 MP + 2 MP AI Dual Camera, and a 5000 mAh High-capacity Battery to offer detailed views of the stunning photos that you can click all day long without running out of battery life.",
          };
          try {
            await Product.create({
              ...productObj,
              created_by: req.user.id,
            });
          } catch (err) {
            throw new Error("Something went wrong");
          }
        });
      });
    }

    res.send({
      status: true,
      data: "Great data populated successfully",
      brand,
    });
  } catch (err) {
    res.send({ status: false, error: err });
  }
});

module.exports = router;
