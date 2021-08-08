const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    category_name: {
      type: String,
      trim: true,
      maxlength: 50,
      required: true,
      lowercase: true,
      index: {
        unique: true,
        dropDups: true,
      },
    },
    is_visible: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    subcategory_list: [
      {
        subcategory: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

categorySchema.methods.toJSON = function () {
  const category = this;
  const categoryObject = category.toObject();
  categoryObject.id = category._id;

  category.subcategory_list.forEach((subcat, index) => {
    categoryObject.subcategory_list[index].id = subcat._id;
    delete categoryObject.subcategory_list[index]._id;
  });

  delete categoryObject._id;
  delete categoryObject.__v;
  delete categoryObject.is_visible;
  delete categoryObject.created_by;

  return categoryObject;
};

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
