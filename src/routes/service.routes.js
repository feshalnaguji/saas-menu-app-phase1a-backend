// src/routes/service.routes.js

const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const { checkServiceAccess } = require("../middlewares/checkServiceAccess");
const {
  checkRestaurantAccess,
} = require("../middlewares/checkRestaurantAccess");

// CREATE new service
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  serviceController.create
);

// GET services for a specific restaurant
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  serviceController.getByRestaurant
);

// UPDATE single service
router.put(
  "/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.update
);

// DEACTIVATE single service
router.delete(
  "/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.deactivate
);

// GET all services globally
router.get(
  "/",
  protect,
  authorizeRoles("superadmin"),
  serviceController.getAllGlobal
);

// DELETE all services globally
router.delete(
  "/",
  protect,
  authorizeRoles("superadmin"),
  serviceController.deleteAll
);

// DISABLE all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  serviceController.disableAllByRestaurant
);

// ENABLE all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  serviceController.enableAllByRestaurant
);

// ENABLE single service for a specific restaurant
router.patch(
  "/:serviceId/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.enableOne
);

// DISABLE one service for a specific restaurant
router.patch(
  "/:serviceId/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.disableOne
);

// DELETE all services for a specific restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  serviceController.deleteAllByRestaurant
);

module.exports = router;
