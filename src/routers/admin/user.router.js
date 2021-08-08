const express = require("express");
const auth = require("./../../middlewares/auth");
const User = require("./../../models/admin/user");
const Cart = require("./../../models/admin/cart");
const logger = require("./../../config/logger");
const router = new express.Router();
const multer = require("multer");
const upload = multer({
  // dest: "node/images/",
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (
      file.originalname.endsWith(".jpg") ||
      file.originalname.endsWith(".png")
    ) {
      cb(undefined, true);
    } else {
      return cb(new Error("Please updload a jpg / png file"));
    }
  },
});

router.post(
  "/upload",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      req.user.avatar = req.file.buffer;
      await req.user.save();
      res.send({ status: true, data: "file uplaoded successfully" });
    } catch (err) {
      logger.error(err);
      res.status(400).send({ status: false, error: err.message });
    }
  },
  (err, req, res, next) => {
    res.send({ status: false, error: err.message });
  }
);

router.get(
  "/user/image/:id",
  async (req, res) => {
    const user = await User.findById(req.params.id);
    try {
      res.set("Content-Type", "image/jpg");
      res.send(user.avatar);
    } catch (err) {
      logger.error(err);
      res.status(400).send({ status: false, error: err.message });
    }
  },
  (err, req, res, next) => {
    res.send({ status: false, error: err.message });
  }
);

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    const cart = (await Cart.findOne({ createdBy: user._id })) || {
      items: [],
    };
    const obj = {};
    obj.user = JSON.parse(JSON.stringify(user));
    obj.user.cart = JSON.parse(JSON.stringify(cart));

    obj.token = token;
    res.send({
      status: true,
      data: obj,
    });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ status: false, error: err.message });
  }
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.send({ status: true, message: "user logged out successfully" });
  } catch (err) {
    logger.error(err);
    res.status(400).send(err.message);
  }
});

router.post("/logout-all", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    req.token = "";

    await req.user.save();
    res.send({
      status: true,
      message: "user logged out from all devices successfully",
    });
  } catch (err) {
    logger.error(err);
    res.status(400).send(err.message);
  }
});

router.post("/sign-up", async (req, res) => {
  try {
    const user = await User.create({ ...req.body });

    if (!user) {
      res.send("Something went wrong unable to create user");
    }

    const token = await user.generateAuthToken();
    res.send({
      status: true,
      data: {
        user,
        token,
        cart: { items: [] },
        message: "User created successfully",
      },
    });
  } catch (err) {
    logger.error(err);
    if (err.code == 11000) {
      res.status(400).send({
        status: false,
        message: "Can't create account as user already exists",
      });
    }
    res.status(400).send({
      status: false,
      message: err.message,
    });
  }

  // USING PROMISES

  // user
  //   .save()
  //   .then((suc) => {
  //     res.send(user);
  //   })
  //   .catch((err) => {
  //     res.status(400).send(err);
  //   });
});

router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find();
    res.send({ status: true, users });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
});

router.get("/user/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const user = await User.findById(_id);
    if (!user) {
      res.status(404).send({ status: false, message: "user does't exist" });
    }
    res.send(user);
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
});

router.post("/address/add", auth, async (req, res) => {
  try {
    req.user.address.push(req.body.address);
    const user = await req.user.save();
    if (!user) {
      throw new Error("user does't exist");
    }

    res.send({ status: true, user });
  } catch (err) {
    logger.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;
