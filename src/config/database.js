const mongoose = require("mongoose");

connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://ankitdhingra1909:bgPBXnT2GvZtfVAx@cluster0.kjolvza.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
