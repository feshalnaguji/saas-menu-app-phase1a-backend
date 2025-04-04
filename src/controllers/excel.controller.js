// controllers/excel.controller.js
const ImportLog = require("../models/ImportLog");
const { v4: uuidv4 } = require("uuid");
const excelService = require("../services/excel.service");
const xlsx = require("xlsx");

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    // 'buffer' now contains the in-memory file contents
    const { buffer, originalname } = req.file;
    const { restaurantId } = req.body;

    // parse the Excel from an in-memory buffer
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    // 1) Count how many item rows are in rawRows
    const itemCount = rawRows.filter((r) => r.type === "item").length;

    // 2) If user is admin, ensure itemCount <= 50
    if (req.user.role === "admin" && itemCount > 50) {
      return res.status(403).json({
        success: false,
        message: "Cannot import more than 50 items. Please contact superadmin.",
      });
    }

    // Convert them to the shape
    const rows = rawRows.map((r) => ({
      type: r.type,
      name: r.name,
      serviceName: r.serviceName,
      categoryName: r.categoryName,
      description: r.description || "",
      price: r.price ?? 0,
      vegNonVeg: r.vegNonVeg,
      portionInfo: r.portionInfo,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      allergens: r.allergens,
      ingredients: r.ingredients,
      imageUrl: r.imageUrl,
      available: r.available,
      isSpecial: r.isSpecial,
    }));

    // parse the file, etc.
    const userId = req.user._id;
    const userName = req.user.name || "";
    const userRole = req.user.role || "";

    // "first import" is always true for /upload
    const isFirstImport = true;

    // call the service
    const importResult = await excelService.bulkImport(
      {
        restaurantId,
        rows,
      },
      originalname,
      userId,
      userName,
      userRole,
      isFirstImport
    );

    // create an ImportLog doc
    const importBatchId = importResult.importBatchId || uuidv4();

    const importLogDoc = new ImportLog({
      fileName: originalname,
      importedAt: new Date(),
      rowCount: importResult.rowCount,
      successCount: importResult.successCount,
      failCount: importResult.failCount,
      errorLogs: importResult.errors || [],
      importBatchId,
      importedBy: req.user.name || "Guest Admin",
      importedByRole: req.user.role || "admin",
      itemCount,
      restaurantId,
      ipAddress: req.ip,
    });
    await importLogDoc.save();

    return res.json({ success: true, data: importResult });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadExcelMerge = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const { buffer, originalname } = req.file;
    const { restaurantId } = req.body;
    const userId = req.user ? req.user._id : null;
    const userName = req.user ? req.user.name || req.user.email : "";
    const userRole = req.user ? req.user.role : "";

    // parse in-memory excel
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    // item limit check for admin
    const itemCount = rawRows.filter((r) => r.type === "item").length;
    if (req.user.role === "admin" && itemCount > 50) {
      return res.status(403).json({
        success: false,
        message: "Cannot import more than 50 items. Please contact superadmin.",
      });
    }

    // map rows
    const rows = rawRows.map((r) => ({
      type: r.type,
      name: r.name,
      serviceName: r.serviceName,
      categoryName: r.categoryName,
      description: r.description || "",
      price: r.price ?? 0,
      vegNonVeg: r.vegNonVeg,
      portionInfo: r.portionInfo,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      allergens: r.allergens,
      ingredients: r.ingredients,
      imageUrl: r.imageUrl,
      available: r.available,
      isSpecial: r.isSpecial,
    }));

    // call the new "merge" service method
    const importResult = await excelService.bulkMergeUpdate(
      { restaurantId, rows },
      originalname,
      userId,
      userName,
      userRole
    );

    const importBatchId = importResult.importBatchId || uuidv4();

    // Create a log doc
    const importLog = new ImportLog({
      fileName: originalname,
      importedAt: new Date(),
      rowCount: importResult.rowCount,
      successCount: importResult.successCount,
      failCount: importResult.failCount,
      errorLogs: importResult.errors || [],
      importBatchId,
      importedBy: req.user.name || "Guest Admin",
      importedByRole: req.user.role || "admin",
      itemCount,
      restaurantId,
      ipAddress: req.ip,
    });
    await importLog.save();

    return res.json({ success: true, data: importResult });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
