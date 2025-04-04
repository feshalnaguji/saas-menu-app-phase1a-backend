// src/models/AuditLog.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ChangeSchema = new Schema(
  {
    field: String,
    oldValue: Schema.Types.Mixed,
    newValue: Schema.Types.Mixed,
  },
  { _id: false }
);

const AuditLogSchema = new Schema(
  {
    docType: {
      type: String, // "service","category","item"
      required: true,
    },
    docId: {
      type: Schema.Types.ObjectId, // references the actual doc
    },
    docName: {
      type: String,
      default: "",
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    operation: {
      type: String,
      enum: ["create", "update", "rename", "disable"],
      required: true,
    },
    changedBy: {
      type: Schema.Types.ObjectId, // the user who changed
    },
    changedByName: {
      type: String,
      default: "",
    },
    changedByRole: {
      type: String,
      default: "",
    },
    firstImportedByName: {
      type: String,
      default: "",
    },
    firstImportedByRole: {
      type: String,
      default: "",
    },
    changes: {
      type: [ChangeSchema],
      default: [],
    },
    importBatchId: {
      type: String,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
