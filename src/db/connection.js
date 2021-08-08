const mongoose = require("mongoose");

const connecToDB = async () => {
  return await mongoose.connect((process.env.CONNECTION_URL || 'mongodb://127.0.0.1:27017/mugulix'), {
    useUnifiedTopology: true,
    useCreateIndex: true,
    useNewUrlParser: true,
  });
};


module.exports = connecToDB;
