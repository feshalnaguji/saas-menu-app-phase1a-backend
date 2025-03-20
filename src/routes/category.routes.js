// src/routes/category.routes.js

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const { checkCategoryAccess } = require("../middlewares/checkCategoryAccess");
const {
  checkRestaurantAccess,
} = require("../middlewares/checkRestaurantAccess");
const { checkServiceAccess } = require("../middlewares/checkServiceAccess");

// CREATE new category
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  categoryController.create
);

// GET categories by service
router.get("/service/:serviceId", protect, categoryController.getByService);

// UPDATE single category
router.put(
  "/:categoryId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  categoryController.update
);

// DEACTIVATE single category
router.delete(
  "/:categoryId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  categoryController.deactivate
);

// GET all categories (global)
router.get(
  "/",
  protect,
  authorizeRoles("superadmin"),
  categoryController.getAllGlobal
);

// DELETE all categories (global)
router.delete(
  "/",
  protect,
  authorizeRoles("superadmin"),
  categoryController.deleteAll
);

// ENABLE all categories by service
router.patch(
  "/service/:serviceId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  categoryController.enableAllByService
);

// DISABLE all categories by service
router.patch(
  "/service/:serviceId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  categoryController.disableAllByService
);

// DELETE all categories by service
router.delete(
  "/service/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  categoryController.deleteAllByService
);

// ENABLE single category
router.patch(
  "/:categoryId/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  categoryController.enableOne
);

// DISABLE single category
router.patch(
  "/:categoryId/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkCategoryAccess,
  categoryController.disableOne
);

// GET all categories by Restaurant
router.get(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  categoryController.getAllByRestaurant
);

// DELETE all categories by Restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkRestaurantAccess,
  categoryController.deleteAllByRestaurant
);

module.exports = router;
