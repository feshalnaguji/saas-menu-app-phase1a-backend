// src/utils/auditLogger.js
const AuditLog = require("../models/AuditLog");

/**
 * For a new doc.
 * If isFirstImport===true, we store firstImportedByName/Role for clarity.
 */
async function logCreate(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  userRole,
  importBatchId,
  isFirstImport = false
) {
  const logData = {
    docType,
    docId,
    docName,
    restaurantId,
    operation: "create",
    importBatchId,
    changes: [],
  };
  if (isFirstImport) {
    // store who originally imported
    logData.firstImportedByName = userName || "";
    logData.firstImportedByRole = userRole || "";
    logData.changedBy = null;
    logData.changedByName = "";
    logData.changedByRole = "";
  } else {
    // normal create in merges
    logData.changedBy = userId;
    logData.changedByName = userName || "";
    logData.changedByRole = userRole || "";
  }
  await AuditLog.create(logData);
}

async function logDisable(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  userRole,
  importBatchId
) {
  await AuditLog.create({
    docType,
    docId,
    docName,
    restaurantId,
    operation: "disable",
    changedBy: userId,
    changedByName: userName || "",
    changedByRole: userRole || "",
    importBatchId,
  });
}

async function logUpdate(
  docType,
  docId,
  docName,
  restaurantId,
  userId,
  userName,
  userRole,
  changesArr,
  importBatchId
) {
  if (!changesArr || changesArr.length === 0) return;
  await AuditLog.create({
    docType,
    docId,
    docName,
    restaurantId,
    operation: "update",
    changedBy: userId,
    changedByName: userName || "",
    changedByRole: userRole || "",
    changes: changesArr,
    importBatchId,
  });
}

async function logRename(
  docType,
  docId,
  oldName,
  newName,
  restaurantId,
  userId,
  userName,
  userRole,
  importBatchId
) {
  await AuditLog.create({
    docType,
    docId,
    docName: newName,
    restaurantId,
    operation: "rename",
    changedBy: userId,
    changedByName: userName || "",
    changedByRole: userRole || "",
    changes: [
      {
        field: "name",
        oldValue: oldName,
        newValue: newName,
      },
    ],
    importBatchId,
  });
}

module.exports = {
  logCreate,
  logDisable,
  logUpdate,
  logRename,
};
