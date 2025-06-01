const mongoose = require("mongoose");

connectDB = async () => {
  await mongoose.connect(
    process.env.MONGO_URL
  );
};

module.exports = connectDB;
