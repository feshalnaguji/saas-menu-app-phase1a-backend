// src/app.js

const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const errorHandler = require("./middlewares/errorHandler");

// Middleware for JSON body parsing
app.use(express.json());

// Routes
const restaurantRoutes = require("./routes/restaurant.routes");
const serviceRoutes = require("./routes/service.routes");
const categoryRoutes = require("./routes/category.routes");
const menuItemRoutes = require("./routes/menuItem.routes");
const excelRoutes = require("./routes/excel.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Security HTTP header
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(helmet());

app.use(compression());

// Root route for health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Mounted routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit-logs", require("./routes/auditLog.routes"));

// Error handling middleware
app.use(errorHandler);

module.exports = app;
