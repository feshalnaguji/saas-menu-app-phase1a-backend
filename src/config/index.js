// src/config/index.js

require("dotenv").config(); // Loads .env into process.env

module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/my-saas-db",
  env: process.env.NODE_ENV || "development",
};
