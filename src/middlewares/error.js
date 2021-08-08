const errorFromMiddleware = (req, res, next) => {
  throw new Error('This is a error from the data');
  next();
};

module.exports = errorFromMiddleware;
