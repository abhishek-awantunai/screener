const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      index: {
        unique: true,
        dropDups: true,
      },
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      trim: true,
      default: "https://cdn.moglix.com/p/Gds5YKXm6p3Tz-medium.jpg",
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      trim: true,
    },
    specification: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    sub_category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timeStamps: true,
  }
);

productSchema.methods.toJSON = function () {
  const product = this;
  const productObject = product.toObject();
  productObject.id = product._id;
  delete productObject._id;
  delete productObject.__v;
  delete productObject.created_by;
  return productObject;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
