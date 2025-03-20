// src/controllers/user.controller.js

const userService = require("../services/user.service");

/**
 * GET /api/users
 * superadmin can see all, admin sees only themselves
 */
async function getAll(req, res) {
  try {
    const users = await userService.getAllUsers();
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/users/:id
 */
async function getOne(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (
      req.user.role !== "superadmin" &&
      String(req.user.userId) !== String(id)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/users/:id
 * superadmin can update user's role, assignedRestaurants, etc.
 */
async function update(req, res) {
  try {
    const { id } = req.params;

    if (
      req.user.role !== "superadmin" &&
      String(req.user.userId) !== String(id)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const updated = await userService.updateUser(id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or not updated" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/users/:id
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await userService.deleteUser(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: `Deleted user ${id}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAll,
  getOne,
  update,
  remove,
};
