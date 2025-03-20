// src/middlewares/fileUpload.js

const multer = require("multer");

// Configure Multer memory storage
const storage = multer.memoryStorage();

// Basic file filter for Excel (xlsx or xls)
function excelFileFilter(req, file, cb) {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

module.exports = upload;
