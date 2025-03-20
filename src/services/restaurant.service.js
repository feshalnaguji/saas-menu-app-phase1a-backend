// src/services/restaurant.service.js

const Restaurant = require("../models/Restaurant");

/**
 * Create a new restaurant
 * @param {Object} data
 * @returns {Promise<Restaurant>}
 */
async function createRestaurant(data) {
  const restaurant = new Restaurant(data);
  return await restaurant.save();
}

/**
 * Get all restaurants
 * @returns {Promise<Restaurant[]>}
 */
async function getAllRestaurants() {
  return await Restaurant.find({ isActive: true }).sort({ createdAt: -1 });
}

/**
 * Get a single restaurant by ID
 * @param {String} id
 * @returns {Promise<Restaurant|null>}
 */
async function getRestaurantById(id) {
  return await Restaurant.findById(id);
}

/**
 * Update a restaurant by ID
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<Restaurant|null>}
 */
async function updateRestaurant(id, data) {
  return await Restaurant.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Soft-delete or deactivate a restaurant by ID (optional)
 * @param {String} id
 * @returns {Promise<Restaurant|null>}
 */
async function deactivateRestaurant(id) {
  return await Restaurant.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

// Global services
async function getAllGlobal() {
  return Restaurant.find().sort({ createdAt: -1 });
}

async function deleteAll() {
  return Restaurant.deleteMany({});
}

async function enableRestaurant(id) {
  return Restaurant.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableRestaurant(id) {
  return Restaurant.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

/**
 * To disable all restaurants globally (extreme case only),
 */
async function disableAllGlobal() {
  return Restaurant.updateMany({}, { isActive: false });
}
async function enableAllGlobal() {
  return Restaurant.updateMany({}, { isActive: true });
}

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deactivateRestaurant,
  getAllGlobal,
  deleteAll,
  enableRestaurant,
  disableRestaurant,
  disableAllGlobal,
  enableAllGlobal,
};
