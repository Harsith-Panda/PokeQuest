const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  // try {
  //   await mongoose.connect(process.env.MONGO_URL);
  //   console.log("Connected to MongoDB");
  // } catch (error) {
  //   console.error("Error connecting to MongoDB:", error);
  //   process.exit(1);
  // }
  //
  if (mongoose.connection.readyState) {
    console.log("MongoDB is already connected!");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
