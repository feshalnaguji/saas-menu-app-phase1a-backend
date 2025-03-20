// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");

router.post("/register", protect, authController.register);

router.post("/login", authController.login);

module.exports = router;
