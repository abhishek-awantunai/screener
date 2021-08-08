require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("./../models/admin/user");
const logger = require("./../config/logger");
const redis = require("redis");

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.UNIQUE_KEY || "mugulix");
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error("Not a good token can't find user");
    }

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    logger.error(err);
    res.status(401).send({ error: "Unauthorized acces please Authenticate" });
  }
};

module.exports = auth;
