// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");

router.get("/", protect, authorizeRoles("superadmin"), userController.getAll);

router.get(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  userController.getOne
);

router.put(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  userController.update
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("superadmin"),
  userController.remove
);

module.exports = router;
