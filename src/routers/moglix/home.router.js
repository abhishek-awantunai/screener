const express = require("express");
const auth = require("./../../middlewares/auth");
const Product = require("./../../models/admin/product");
const Category = require("./../../models/admin/category");
const Home = require("./../../models/moglix/home.model");
const logger = require("./../../config/logger");

const router = express.Router();

router.get("/get-product-list", async (req, res) => {
  try {
    const home = await Home.find().lean();

    // Extract the category list
    let category_list = [...home[0]["categoryList"]];

    let carausal_data = JSON.parse(JSON.stringify(home[0]));
    let cdata = {};
    cdata["flyer"] = [];
    cdata["advertisement"] = [];
    cdata["coupon"] = carausal_data.coupon;

    // Create carausel and caption data
    for (let i = 1; i < 6; i++) {
      const obj = {
        img_url: carausal_data["image" + i],
        caption: carausal_data["caption" + i],
      };
      cdata["flyer"].push(obj);
    }

    // Create advertisement data
    for (let i = 1; i < 4; i++) {
      const obj = {
        img_url: carausal_data["advImg" + i],
      };
      cdata["advertisement"].push(obj);
    }

    if (
      !(category_list && category_list.length > 0 && category_list.length < 9)
    ) {
      throw new Error("Need atleas one category to fetch products");
    }

    let $or = [];
    category_list.forEach((category, iii) => {
      $or.push({ category });
    });

    // Get categories list
    const cateogries = await Category.find().lean();

    let products = await Product.find({ $or }).lean().limit(75);

    const product_array = [];

    category_list.forEach((category, iii) => {
      const data = {};
      const current_category = cateogries.filter((categ) => {
        return categ._id == category;
      })[0];

      data["name"] = current_category["category_name"];
      data["id"] = current_category["id"];
      data["products"] = products.filter(
        (product) => product.category === category
      );
      data["products"].forEach((product) => {
        product.category = data["name"];
        product.sub_category = current_category.subcategory_list.filter(
          (sub) => {
            return sub.id === product.sub_category;
          }
        )["subcategory"];
      });
      product_array.push(data);
    });

    res.status(200).send({
      status: true,
      data: { banner_data: cdata, category_data: product_array },
    });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, error: err.message });
  }
});

router.post("/update-home-data", async (req, res) => {
  try {
    if (
      !req.body.categoryList ||
      req.body.categoryList.length === 0 ||
      req.body.categoryList.length > 8
    ) {
      throw new Error("Category list can't be blank or greater than 8");
    }

    const home = await Home.find();

    if (!home) {
      throw new Error("Home data does not exists");
    }

    for (const key in req.body) {
      if (req.body.hasOwnProperty(key)) {
        home[0][key] = req.body[key];
      }
    }
    home[0].save();

    res.send({ status: true, data: home[0] });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, error: err.message });
  }
});

module.exports = router;
