// src/server.js

const app = require("./app");
const connectDB = require("./config/db");
const { port } = require("./config/index");

// Connect to MongoDB
connectDB()
  .then(() => {
    // Start the server only if DB connection is successful
    app.listen(port, () => {
      console.log(`[Server] App listening on port ${port}`);
    });
    console.log("Server is running");
  })
  .catch((err) => {
    console.error("[Server] Error connecting to DB:", err);
    process.exit(1);
  });
