// src/services/user.service.js

const User = require("../models/User");

/**
 * Get all users
 */
async function getAllUsers() {
  return User.find().sort({ createdAt: -1 });
}

/**
 * Get single user by ID
 */
async function getUserById(id) {
  return User.findById(id);
}

/**
 * Update user
 */
async function updateUser(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete user
 */
async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
