// src/routes/restaurant.routes.js

const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const {
  checkRestaurantAccess,
} = require("../middlewares/checkRestaurantAccess");

// CREATE new restaurant
router.post(
  "/",
  protect,
  authorizeRoles("superadmin"),
  restaurantController.create
);

// GET all active restaurants
router.get("/", restaurantController.getAll);

// GET single restaurant by ID
router.get("/:id", protect, restaurantController.getOne);

// UPDATE single restaurant
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  restaurantController.update
);

// DEACTIVATE single (similar to disable or soft-delete)
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  restaurantController.deactivate
);

// GET QR for restaurant
router.get(
  "/:id/qr",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  restaurantController.getQRCode
);

// GET all global
router.get(
  "/all/global",
  protect,
  authorizeRoles("superadmin"),
  restaurantController.getAllGlobal
);

// DELETE ALL restaurants globally
router.delete(
  "/all/global",
  protect,
  authorizeRoles("superadmin"),
  restaurantController.deleteAll
);

// ENABLE ALL restaurants globally
router.patch(
  "/all/global/enable",
  protect,
  authorizeRoles("superadmin"),
  restaurantController.enableAllGlobal
);

// DISABLE ALL restaurants globally
router.patch(
  "/all/global/disable",
  protect,
  authorizeRoles("superadmin"),
  restaurantController.disableAllGlobal
);

// ENABLE single
router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  restaurantController.enableOne
);

// DISABLE single
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  restaurantController.disableOne
);

module.exports = router;
