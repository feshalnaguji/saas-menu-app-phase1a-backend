// src/controllers/menuItem.controller.js

const menuItemService = require("../services/menuItem.service");

/**
 * Create new menu item
 * req.body: { categoryId, name, price, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const item = await menuItemService.createMenuItem(data);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

/**
 * Get items by category
 */
async function getByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const items = await menuItemService.getItemsByCategory(categoryId);
    return res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

/**
 * Update menu item
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await menuItemService.updateMenuItem(id, data);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found or not updated",
      });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Disable (make unavailable) menu item
 */
async function disable(req, res, next) {
  try {
    const { id } = req.params;
    const result = await menuItemService.disableMenuItem(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// New global or category-level methods
async function getAllGlobal(req, res, next) {
  try {
    const items = await menuItemService.getAllItemsGlobal();
    return res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function deleteAllGlobal(req, res, next) {
  try {
    const result = await menuItemService.deleteAllItemsGlobal();
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} menu items globally`,
    });
  } catch (err) {
    next(err);
  }
}

async function enableOne(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await menuItemService.enableOne(id);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function disableOne(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await menuItemService.disableOne(id);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

async function enableAllByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const result = await menuItemService.enableAllByCategory(categoryId);
    return res.json({
      success: true,
      message: `Enabled ${result.modifiedCount} items for category ${categoryId}`,
    });
  } catch (err) {
    next(err);
  }
}

async function disableAllByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const result = await menuItemService.disableAllByCategory(categoryId);
    return res.json({
      success: true,
      message: `Disabled ${result.modifiedCount} items for category ${categoryId}`,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAllByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const result = await menuItemService.deleteAllByCategory(categoryId);
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} items for category ${categoryId}`,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const items = await menuItemService.getAllItemsByRestaurant(restaurantId);
    return res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function deleteAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const result = await menuItemService.deleteAllItemsByRestaurant(
      restaurantId
    );
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} menu items for restaurant ${restaurantId}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getByCategory,
  update,
  disable,
  getAllGlobal,
  deleteAllGlobal,
  enableOne,
  disableOne,
  enableAllByCategory,
  disableAllByCategory,
  deleteAllByCategory,
  getAllByRestaurant,
  deleteAllByRestaurant,
};
