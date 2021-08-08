const createPagination = (model) => {
  return async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy;
    const order = parseInt(req.query.order);

    let sort;
    if (sortBy && order) {
      sort = {
        [sortBy]: order,
      };
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    results.limit = limit;

    try {
      delete req.query.page;
      delete req.query.limit;
      delete req.query.sortBy;
      delete req.query.order;

      const resultModel = await model
        .find(req.query)
        .limit(limit)
        .skip(startIndex)
        .sort(sort)
        .lean()
        .exec();

      results.count = 1000;

      if (endIndex < results.count) {
        results.next = page + 1;
      }

      if (startIndex > 0) {
        results.prev = page - 1;
      }

      results.results = resultModel;
      res.paginatedResult = results;
      next();
    } catch (err) {
      res.send({ status: false, error: err.message });
    }
  };
};

module.exports = createPagination;
