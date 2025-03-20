// src/services/service.service.js

const Service = require("../models/Service");

/**
 * Create a new service
 * @param {Object} data
 * @returns {Promise<Service>}
 */
async function createService(data) {
  const service = new Service(data);
  return await service.save();
}

/**
 * Get all services for a given restaurant
 * @param {String} restaurantId
 * @returns {Promise<Service[]>}
 */
async function getServicesByRestaurant(restaurantId) {
  return await Service.find({
    restaurantId,
    isActive: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a service by ID
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<Service|null>}
 */
async function updateService(id, data) {
  return await Service.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Deactivate a service by ID
 * @param {String} id
 * @returns {Promise<Service|null>}
 */
async function deactivateService(id) {
  return await Service.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

/**
 * Get all services (across all restaurants)
 * @returns {Promise<AllServices[]>}
 */
async function getAllServicesGlobal() {
  return Service.find().sort({ createdAt: -1 });
}

/**
 * Delete all services (across all restaurants)
 * @returns {Promise<AllServices|null>}
 */
async function deleteAllServices() {
  return Service.deleteMany({});
}

// Deactivate/Disable all services for a Restaurant
async function disableAllServicesByRestaurant(restaurantId) {
  return Service.updateMany({ restaurantId }, { $set: { isActive: false } });
}

// Enable all services for a Restaurant
async function enableAllServicesByRestaurant(restaurantId) {
  return Service.updateMany({ restaurantId }, { $set: { isActive: true } });
}

// Enable/Disable single service
async function enableService(id) {
  return Service.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableService(id) {
  return Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

// Delete all services for a Restaurant
async function deleteAllServicesByRestaurant(restaurantId) {
  return Service.deleteMany({ restaurantId });
}

module.exports = {
  createService,
  getServicesByRestaurant,
  updateService,
  deactivateService,
  getAllServicesGlobal,
  deleteAllServices,
  disableAllServicesByRestaurant,
  enableAllServicesByRestaurant,
  enableService,
  disableService,
  deleteAllServicesByRestaurant,
};
