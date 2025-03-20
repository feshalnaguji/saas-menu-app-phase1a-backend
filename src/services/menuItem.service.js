// src/services/menuItem.service.js

const MenuItem = require("../models/MenuItem");
const Service = require("../models/Service");
const Category = require("../models/Category");

/**
 * Create a new menu item
 * @param {Object} data
 * @returns {Promise<MenuItem>}
 */
async function createMenuItem(data) {
  const item = new MenuItem(data);
  return await item.save();
}

/**
 * Get items by category
 * @param {String} categoryId
 * @returns {Promise<MenuItem[]>}
 */
async function getItemsByCategory(categoryId) {
  return await MenuItem.find({
    categoryId,
    available: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a menu item
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<MenuItem|null>}
 */
async function updateMenuItem(id, data) {
  return await MenuItem.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Mark a menu item as unavailable/disable it
 * @param {String} id
 * @returns {Promise<MenuItem|null>}
 */
async function disableMenuItem(id) {
  return await MenuItem.findByIdAndUpdate(
    id,
    { available: false },
    { new: true }
  );
}

// Global methods
async function getAllItemsGlobal() {
  return await MenuItem.find().sort({ createdAt: -1 });
}

async function deleteAllItemsGlobal() {
  return MenuItem.deleteMany({});
}

/**
 * Enable/Disable single item
 */
async function enableOne(id) {
  return MenuItem.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableOne(id) {
  return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

/**
 * Enable/Disable all items by category
 */
async function enableAllByCategory(categoryId) {
  return MenuItem.updateMany({ categoryId }, { $set: { isActive: true } });
}
async function disableAllByCategory(categoryId) {
  return MenuItem.updateMany({ categoryId }, { $set: { isActive: false } });
}

/**
 * Delete all items by category
 */
async function deleteAllByCategory(categoryId) {
  return MenuItem.deleteMany({ categoryId });
}

// Get all menu items by Restaurant
async function getAllItemsByRestaurant(restaurantId) {
  // find all services for that restaurant
  const services = await Service.find({ restaurantId }).select("_id");
  const serviceIds = services.map((s) => s._id);

  // find all categories for those services
  const categories = await Category.find({
    serviceId: { $in: serviceIds },
  }).select("_id");
  const categoryIds = categories.map((c) => c._id);

  // find items for those categoryIds
  return MenuItem.find({ categoryId: { $in: categoryIds } }).sort({
    createdAt: -1,
  });
}

// Delete all menu items by Restaurant
async function deleteAllItemsByRestaurant(restaurantId) {
  const services = await Service.find({ restaurantId }).select("_id");
  const serviceIds = services.map((s) => s._id);

  const categories = await Category.find({
    serviceId: { $in: serviceIds },
  }).select("_id");
  const categoryIds = categories.map((c) => c._id);

  return MenuItem.deleteMany({ categoryId: { $in: categoryIds } });
}

module.exports = {
  createMenuItem,
  getItemsByCategory,
  updateMenuItem,
  disableMenuItem,
  getAllItemsGlobal,
  deleteAllItemsGlobal,
  enableOne,
  disableOne,
  enableAllByCategory,
  disableAllByCategory,
  deleteAllByCategory,
  getAllItemsByRestaurant,
  deleteAllItemsByRestaurant,
};
