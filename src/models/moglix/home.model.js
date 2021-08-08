const mongoose = require("mongoose");

const homeSchema = mongoose.Schema(
  {
    categoryList: [
      {
        type: String,
        required: true,
      },
    ],
    image1: {
      type: String,
      default: "",
    },
    image2: {
      type: String,
      default: "",
    },
    image3: {
      type: String,
      default: "",
    },
    image4: {
      type: String,
      default: "",
    },
    image5: {
      type: String,
      default: "",
    },
    caption1: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    caption2: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    caption3: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    caption4: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    caption5: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    advImg1: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    advImg2: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    advImg3: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
    coupon: {
      type: String,
      trim: true,
      required: true,
      default: "",
    },
  },
  {
    timeStamps: true,
  }
);

homeSchema.methods.toJSON = function () {
  const home = this;
  const homeObj = home.toObject();
  delete homeObj.__v;
  delete homeObj._id;

  return homeObj;
};

const Home = mongoose.model("Home", homeSchema);

module.exports = Home;
