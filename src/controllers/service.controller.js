// src/controllers/service.controller.js

const serviceService = require("../services/service.service");

/**
 * Create new service
 * req.body: { restaurantId, name, description, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const svc = await serviceService.createService(data);
    return res.status(201).json({ success: true, data: svc });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all services for a restaurant
 */
async function getByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const services = await serviceService.getServicesByRestaurant(restaurantId);
    return res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

/**
 * Update service
 */
async function update(req, res, next) {
  try {
    const { serviceId } = req.params;
    const data = req.body;
    const updated = await serviceService.updateService(serviceId, data);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found or not updated" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate service
 */
async function deactivate(req, res, next) {
  try {
    const { serviceId } = req.params;
    const result = await serviceService.deactivateService(serviceId);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all services (across all restaurants)
 */
async function getAllGlobal(req, res, next) {
  try {
    const services = await serviceService.getAllServicesGlobal();
    return res.json({ success: true, data: services });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete all services (across all restaurants)
 */
async function deleteAll(req, res, next) {
  try {
    const result = await serviceService.deleteAllServices();
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} services`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/services/restaurant/:restaurantId/disableAll
 */
async function disableAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const result = await serviceService.disableAllServicesByRestaurant(
      restaurantId
    );
    return res.json({
      success: true,
      message: `Disabled ${result.modifiedCount} services for restaurant ${restaurantId}`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/services/restaurant/:restaurantId/enableAll
 */
async function enableAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const result = await serviceService.enableAllServicesByRestaurant(
      restaurantId
    );
    return res.json({
      success: true,
      message: `Enabled ${result.modifiedCount} services for restaurant ${restaurantId}`,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/services/:serviceId/enable
 */
async function enableOne(req, res, next) {
  try {
    const { serviceId } = req.params;
    const updated = await serviceService.enableService(serviceId);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/services/:serviceId/disable
 */
async function disableOne(req, res, next) {
  try {
    const { serviceId } = req.params;
    const updated = await serviceService.disableService(serviceId);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/services/restaurant/:restaurantId
 * Delete all services for a restaurant
 */
async function deleteAllByRestaurant(req, res, next) {
  try {
    const { restaurantId } = req.params;
    const result = await serviceService.deleteAllServicesByRestaurant(
      restaurantId
    );
    return res.json({
      success: true,
      message: `Deleted ${result.deletedCount} services under restaurant ${restaurantId}`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getByRestaurant,
  update,
  deactivate,
  getAllGlobal,
  deleteAll,
  disableAllByRestaurant,
  enableAllByRestaurant,
  enableOne,
  disableOne,
  deleteAllByRestaurant,
};
