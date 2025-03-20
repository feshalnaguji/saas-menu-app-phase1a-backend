// src/routes/excel.routes.js

const express = require("express");
const router = express.Router();
const excelController = require("../controllers/excel.controller");
const upload = require("../middlewares/fileUpload"); // Multer
const { protect, authorizeRoles } = require("../middlewares/auth");
const {
  checkExcelRestaurantAccess,
} = require("../middlewares/checkExcelRestaurantAccess");

// POST /api/excel/upload
router.post(
  "/upload",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("file"),
  checkExcelRestaurantAccess,
  excelController.uploadExcel
);

module.exports = router;
