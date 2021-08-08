const express = require("express");
const auth = require("./../../middlewares/auth");
const CartItem = require("./../../models/admin/cart");

const router = express.Router();

router.get("/get", auth, async (req, res) => {
  try {
    const cart = await CartItem.findOne({ createdBy: req.user._id });
    res.send({ status: true, cart });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
});

router.post("/update", auth, async (req, res) => {
  try {
    if (!req.body.items || !Array.isArray(req.body.items)) {
      throw new Error("Items key is necessary");
    }

    let updatedCart = {
      createdBy: req.user.id,
      items: [],
      totalPrice: 0,
    };

    req.body.items.forEach((item) => {
      if (
        !item.hasOwnProperty("productId") ||
        !item.hasOwnProperty("price") ||
        !item.hasOwnProperty("name") ||
        !item.hasOwnProperty("brand") ||
        !item.hasOwnProperty("quantity")
      ) {
        throw new Error("Please add valid items in the cart");
      }

      const cartItem = {
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
        brand: item.brand,
      };

      const total = parseInt(cartItem.price) * parseInt(cartItem.quantity);

      updatedCart.items.push(cartItem);
      updatedCart.totalPrice += total;
    });

    const cart = await CartItem.findOne({ createdBy: req.user._id });

    let savedCart;
    if (!cart) {
      savedCart = await CartItem.create(updatedCart);
    } else {
      cart.items = JSON.parse(JSON.stringify(updatedCart.items));
      cart.totalPrice = updatedCart.totalPrice;
      savedCart = await cart.save();
    }

    res.send({ status: true, cart: savedCart });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
});

module.exports = router;
