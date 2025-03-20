// src/controllers/category.controller.js

const categoryService = require("../services/category.service");

/**
 * Create new category
 * req.body: { serviceId, name, description, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const category = await categoryService.createCategory(data);
    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

/**
 * Get categories by service
 */
async function getByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const categories = await categoryService.getCategoriesByService(serviceId);
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * Update category
 */
async function update(req, res, next) {
  try {
    const { id } = req.params; // category id
    const data = req.body;
    const updated = await categoryService.updateCategory(id, data);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found or not updated" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate category
 */
async function deactivate(req, res, next) {
  try {
    const { id } = req.params;
    const result = await categoryService.deactivateCategory(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all categories (across all restaurants)
 */
async function getAllGlobal(req, res, next) {
  try {
    const categories = await categoryService.getAllCategoriesGlobal();
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete all services (across all restaurants)
 */
async function deleteAll(req, res, next) {
  try {
    const result = await categoryService.deleteAllCategories();
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} categories`,
    });
  } catch (err) {
    next(err);
  }
}

// Enable/Disable single category
async function enableOne(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await categoryService.enableCategory(id);
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
async function disableOne(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await categoryService.disableCategory(id);
    if (!updated)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
async function enableAllByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const result = await categoryService.enableAllByService(serviceId);
    return res.json({
      success: true,
      message: `Enabled ${result.modifiedCount} categories in service ${serviceId}`,
    });
  } catch (err) {
    next(err);
  }
}
async function disableAllByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const result = await categoryService.disableAllByService(serviceId);
    return res.json({
      success: true,
      message: `Disabled ${result.modifiedCount} categories in service ${serviceId}`,
    });
  } catch (err) {
    next(err);
  }
}
async function deleteAllByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const result = await categoryService.deleteAllByService(serviceId);
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} categories in service ${serviceId}`,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const cats = await categoryService.getAllCategoriesByRestaurant(
      restaurantId
    );
    return res.json({ success: true, data: cats });
  } catch (err) {
    next(err);
  }
}

async function deleteAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const result = await categoryService.deleteAllCategoriesByRestaurant(
      restaurantId
    );
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} categories for restaurant ${restaurantId}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getByService,
  update,
  deactivate,
  getAllGlobal,
  deleteAll,
  enableOne,
  disableOne,
  enableAllByService,
  disableAllByService,
  deleteAllByService,
  getAllByRestaurant,
  deleteAllByRestaurant,
};
