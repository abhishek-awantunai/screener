require("dotenv").config();

const cors = require("cors");
const express = require("express");
const redis = require("redis");
// const cluster = require("cluster");
// const logger = require("morgan");
// const fs = require("fs-extra");
// const rfs = require("rotating-file-stream");
// const path = require("path");
// const logger = require("./config/logger");

const connecToDB = require("./db/connection");
const homeRoutes = require("./routers/moglix/home.router");
const adminRoutes = require("./routers/admin/user.router");
const productRoutes = require("./routers/admin/product.router");
const categoryRoutes = require("./routers/admin/category.router");
const cartRoutes = require('./routers/admin/cart.router');

const PORT = process.env.PORT || 4242;
const APP_PORT = process.env.APP_PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());

connecToDB();

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/category", categoryRoutes);
app.use("/api/admin/product", productRoutes);
app.use("/api/admin/cart", cartRoutes);

// Moglix Routes
app.use("/api/moglix", adminRoutes);
app.use("/api/moglix/category", categoryRoutes);
app.use("/api/moglix/product", productRoutes);
app.use("/api/moglix/home", homeRoutes);
app.use("/api/moglix/cart", cartRoutes);

app.use((req, res, next) => {
  res.status(404).send('<h1>Page Not Found</h1>');
});

app.listen(PORT, () => {
  console.log(
    `App is up and running frontend port : ${APP_PORT} and backend port : ${PORT}`
  );
});
