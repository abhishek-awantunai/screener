const express = require("express");
const auth = require("./../../middlewares/auth");
const Category = require("./../../models/admin/category");
const logger = require("./../../config/logger");

const router = new express.Router();

router.post("/add", auth, async (req, res) => {
  try {
    const category = await Category.create({
      ...req.body,
      created_by: req.user._id,
    });

    if (!category) {
      res.send({
        status: false,
        error: "Something went wrong unable to create category",
      });
    }

    res.send({
      status: true,
      data: { category },
    });
  } catch (err) {
    if (err.code == 11000) {
      res.status(400).send({
        status: false,
        message: "Can't create category as this category already exists",
      });
    }
    res.status(400).send({ status: false, message: err.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const categories = await Category.find();
    res.send({ status: true, data: categories });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/add-subcategory", auth, async (req, res) => {
  try {
    const category_id = req.body.id;
    const subcategory_name = req.body.subcategory_name;

    if (!category_id) {
      throw new Error("id is required");
    }
    if (!subcategory_name) {
      throw new Error("Subcategory name is required");
    }

    const category = await Category.findOne({ _id: category_id });

    if (!category) {
      throw new Error("This category does not exists");
    }

    const index = category.subcategory_list.findIndex(
      (x) => x.subcategory === subcategory_name
    );

    if (index < 0) {
      category.subcategory_list.push({ subcategory: subcategory_name });
      await category.save();
    } else {
      throw new Error("This subcategory already exists");
    }

    res.send({ status: true, data: category });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/delete", auth, async (req, res) => {
  try {
    const id = req.body.id;
    if (!id) {
      throw new Error("id of category is required");
    }

    await Category.deleteOne({ _id: id });

    res.send({ status: true, data: "category deleted successfully" });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
});

module.exports = router;
