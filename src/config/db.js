// src/config/db.js

const mongoose = require("mongoose");
const { mongoUri, env } = require("./index");

// Additional Mongoose options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connectDB() {
  try {
    await mongoose.connect(mongoUri, mongooseOptions);
  } catch (error) {
    console.error("[DB] Error connecting to MongoDB:", error);
    process.exit(1); // Exit if DB connection fails
  }
}

module.exports = connectDB;
