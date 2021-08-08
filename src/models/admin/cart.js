const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    createdBy: {
      type: String,
      index: {
        unique: true,
        dropDups: true,
      },
      required: true,
      trim: true,
    },
    items: [{}],
    totalPrice: Number,
  },
  {
    timestamps: true,
  }
);

cartSchema.methods.toJSON = function () {
  const cart = this;
  const cartObj = cart.toObject();

  delete cartObj.__v;
  delete cartObj._id;
  delete cartObj.createdAt;
  delete cartObj.updatedAt;

  return cartObj;
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
