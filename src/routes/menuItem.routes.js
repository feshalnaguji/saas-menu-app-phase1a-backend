// src/routes/menuItem.routes.js

const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const { checkMenuItemAccess } = require("../middlewares/checkMenuItemAccess");
const { checkCategoryAccess } = require("../middlewares/checkCategoryAccess");
const {
  checkRestaurantAccess,
} = require("../middlewares/checkRestaurantAccess");

// CREATE new menu item
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  menuItemController.create
);

// GET items by category
router.get("/category/:categoryId", protect, menuItemController.getByCategory);

// UPDATE single item
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.update
);

// DISABLE (soft delete) single item
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.disable
);

// GET all items (global)
router.get(
  "/",
  protect,
  authorizeRoles("superadmin"),
  menuItemController.getAllGlobal
);

// DELETE all items (global)
router.delete(
  "/",
  protect,
  authorizeRoles("superadmin"),
  menuItemController.deleteAllGlobal
);

// ENABLE single item
router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.enableOne
);

// DISABLE single item
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.disableOne
);

// ENABLE all items by category
router.patch(
  "/category/:categoryId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  menuItemController.enableAllByCategory
);

// DISABLE all items by category
router.patch(
  "/category/:categoryId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  menuItemController.disableAllByCategory
);

// DELETE all items by category
router.delete(
  "/category/:categoryId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  menuItemController.deleteAllByCategory
);

// GET all items by Restaurant
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  menuItemController.getAllByRestaurant
);

// DELETE all items by Restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  menuItemController.deleteAllByRestaurant
);

module.exports = router;
