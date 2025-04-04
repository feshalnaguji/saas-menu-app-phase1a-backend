// src/routes/auditLog.routes.js
const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { protect, authorizeRoles } = require("../middlewares/auth");

// GET all logs (superadmin only)
router.get("/", protect, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET logs by restaurant
router.get("/restaurant/:restaurantId", protect, async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const logs = await AuditLog.find({ restaurantId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE all logs (superadmin only)
router.delete("/", protect, authorizeRoles("superadmin"), async (req, res) => {
  try {
    await AuditLog.deleteMany({});
    return res.json({ success: true, message: "All logs deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
