// src/services/category.service.js

const Category = require("../models/Category");
const Service = require("../models/Service");

/**
 * Create a new category
 * @param {Object} data
 * @returns {Promise<Category>}
 */
async function createCategory(data) {
  const category = new Category(data);
  return await category.save();
}

/**
 * Get categories by service
 * @param {String} serviceId
 * @returns {Promise<Category[]>}
 */
async function getCategoriesByService(serviceId) {
  return await Category.find({
    serviceId,
    isActive: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a category
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<Category|null>}
 */
async function updateCategory(id, data) {
  return await Category.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Deactivate category
 * @param {String} id
 * @returns {Promise<Category|null>}
 */
async function deactivateCategory(id) {
  return await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

/**
 * Get all categories (across all restaurants)
 * @returns {Promise<AllCategories[]>}
 */
async function getAllCategoriesGlobal() {
  return Category.find().sort({ createdAt: -1 });
}

/**
 * Delete all categories (across all restaurants)
 * @returns {Promise<AllCategories|null>}
 */
async function deleteAllCategories() {
  return Category.deleteMany({});
}

// enable/disable single category
async function enableCategory(id) {
  return Category.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableCategory(id) {
  return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

// enable/disable all for a given service
async function enableAllByService(serviceId) {
  return Category.updateMany({ serviceId }, { $set: { isActive: true } });
}
async function disableAllByService(serviceId) {
  return Category.updateMany({ serviceId }, { $set: { isActive: false } });
}

// delete all categories for service
async function deleteAllByService(serviceId) {
  return Category.deleteMany({ serviceId });
}

// Get all categories by Restaurant
async function getAllCategoriesByRestaurant(restaurantId) {
  // find all services for this restaurant
  const services = await Service.find({ restaurantId }).select("_id");
  const serviceIds = services.map((s) => s._id);

  // find categories that belong to those serviceIds
  return Category.find({ serviceId: { $in: serviceIds } }).sort({
    createdAt: -1,
  });
}

// Delete all categories by Restaurant
async function deleteAllCategoriesByRestaurant(restaurantId) {
  // find all services for this restaurant
  const services = await Service.find({ restaurantId }).select("_id");
  const serviceIds = services.map((s) => s._id);

  // delete categories with those service IDs
  return Category.deleteMany({ serviceId: { $in: serviceIds } });
}

module.exports = {
  createCategory,
  getCategoriesByService,
  updateCategory,
  deactivateCategory,
  getAllCategoriesGlobal,
  deleteAllCategories,
  enableCategory,
  disableCategory,
  enableAllByService,
  disableAllByService,
  deleteAllByService,
  getAllCategoriesByRestaurant,
  deleteAllCategoriesByRestaurant,
};
