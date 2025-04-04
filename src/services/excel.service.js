// src/services/excel.service.js

const { v4: uuidv4 } = require("uuid");
const Service = require("../models/Service");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

// audit logging helpers
const {
  logCreate,
  logDisable,
  logUpdate,
  logRename,
} = require("../utils/auditLogger");

/**
 * FULL UPLOAD: Deactivates old docs, logs "disable", then creates new docs, logs "create".
 */
async function bulkImport(importData, fileName, userId, userName, userRole) {
  const { restaurantId, rows } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 1) Find old docs
    const oldServices = await Service.find({ restaurantId });
    const oldServiceIds = oldServices.map((svc) => svc._id);

    const oldCategories = await Category.find({
      serviceId: { $in: oldServiceIds },
    });
    const oldCategoryIds = oldCategories.map((cat) => cat._id);

    const oldItems = await MenuItem.find({
      categoryId: { $in: oldCategoryIds },
    });

    // 2) disable
    for (const svc of oldServices) {
      if (svc.isActive) {
        svc.isActive = false;
        await svc.save();
        await logDisable(
          "service",
          svc._id,
          svc.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
      }
    }
    for (const cat of oldCategories) {
      if (cat.isActive) {
        cat.isActive = false;
        await cat.save();
        await logDisable(
          "category",
          cat._id,
          cat.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
      }
    }
    for (const it of oldItems) {
      if (it.isActive) {
        it.isActive = false;
        await it.save();
        await logDisable(
          "item",
          it._id,
          it.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
      }
    }

    // 3) re-create new docs
    for (let i = 0; i < rows.length; i++) {
      rowCount++;
      const row = rows[i];
      const lineIndex = i + 1;

      try {
        if (row.type === "service") {
          const svcDoc = new Service({
            restaurantId,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
            importType: "service",
            importLine: lineIndex,
          });
          await svcDoc.save();
          // log create => pass isFirstImport=true
          await logCreate(
            "service",
            svcDoc._id,
            svcDoc.name,
            restaurantId,
            userId,
            userName,
            userRole,
            importBatchId,
            true
          );
          successCount++;
        } else if (row.type === "category") {
          let parentSvc = await Service.findOne({
            restaurantId,
            name: row.serviceName,
          });
          if (!parentSvc) {
            parentSvc = new Service({
              restaurantId,
              name: row.serviceName,
              importBatch: importBatchId,
              importType: "service",
              importLine: null,
            });
            await parentSvc.save();
            await logCreate(
              "service",
              parentSvc._id,
              parentSvc.name,
              restaurantId,
              userId,
              userName,
              userRole,
              importBatchId,
              true
            );
          }
          const catDoc = new Category({
            serviceId: parentSvc._id,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
            importType: "category",
            importLine: lineIndex,
          });
          await catDoc.save();
          await logCreate(
            "category",
            catDoc._id,
            catDoc.name,
            restaurantId,
            userId,
            userName,
            userRole,
            importBatchId,
            true
          );
          successCount++;
        } else if (row.type === "item") {
          let catDoc = await Category.findOne({
            name: row.categoryName,
          }).populate("serviceId");
          if (!catDoc) {
            catDoc = new Category({
              name: row.categoryName,
              importBatch: importBatchId,
              importType: "category",
              importLine: null,
            });
            await catDoc.save();
            await logCreate(
              "category",
              catDoc._id,
              catDoc.name,
              restaurantId,
              userId,
              userName,
              userRole,
              importBatchId,
              true
            );
          }

          const itemDoc = new MenuItem({
            categoryId: catDoc._id,
            name: row.name,
            isActive: row.isActive !== false,
            importBatch: importBatchId,
            importType: "item",
            importLine: lineIndex,
            price: row.price ?? 0,
            description: row.description || "",
            vegNonVeg: row.vegNonVeg || "veg",
            portionInfo: row.portionInfo || "",
            nutritionalInfo: {
              calories: row.calories ?? 0,
              protein: row.protein ?? 0,
              carbs: row.carbs ?? 0,
              fat: row.fat ?? 0,
            },
            allergens: row.allergens ? row.allergens.split(",") : [],
            ingredients: row.ingredients ? row.ingredients.split(",") : [],
            imageUrl: row.imageUrl || "",
            available: row.available !== false,
            isSpecial: row.isSpecial === true,
          });
          await itemDoc.save();
          await logCreate(
            "item",
            itemDoc._id,
            itemDoc.name,
            restaurantId,
            userId,
            userName,
            userRole,
            importBatchId,
            true
          );
          successCount++;
        } else {
          failCount++;
          errors.push(`Unknown row type '${row.type}'`);
        }
      } catch (err) {
        failCount++;
        errors.push(`Row error (line ${lineIndex}): ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`General import error: ${err.message}`);
  }

  return {
    rowCount,
    successCount,
    failCount,
    importBatchId,
    errors,
  };
}

/**
 * MERGE UPLOAD: row-position approach. We store "create", "disable", "rename", "update"
 * in the audit logs with docName, plus user info & importBatchId.
 */
async function bulkMergeUpdate(
  importData,
  fileName,
  userId,
  userName,
  userRole
) {
  const { restaurantId, rows } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 1) load existing docs
    const existingServices = await Service.find({ restaurantId });
    const existingCats = await Category.find({
      serviceId: { $in: existingServices.map((s) => s._id) },
    });
    const existingItems = await MenuItem.find({
      categoryId: { $in: existingCats.map((c) => c._id) },
    });

    // build docMap
    const docMap = new Map();
    const unusedDocs = new Set();

    // put them in docMap
    for (const svc of existingServices) {
      const key =
        svc.importType && svc.importLine != null
          ? `${svc.importType}-${svc.importLine}`
          : null;
      if (key) docMap.set(key, svc);
      unusedDocs.add(svc._id.toString());
    }
    for (const cat of existingCats) {
      const key =
        cat.importType && cat.importLine != null
          ? `${cat.importType}-${cat.importLine}`
          : null;
      if (key) docMap.set(key, cat);
      unusedDocs.add(cat._id.toString());
    }
    for (const it of existingItems) {
      const key =
        it.importType && it.importLine != null
          ? `${it.importType}-${it.importLine}`
          : null;
      if (key) docMap.set(key, it);
      unusedDocs.add(it._id.toString());
    }

    // 2) parse each row => either rename, update, or create new
    for (let i = 0; i < rows.length; i++) {
      rowCount++;
      const row = rows[i];
      const lineIndex = i + 1;
      const key = `${row.type}-${lineIndex}`;

      try {
        const oldDoc = docMap.get(key);
        if (oldDoc) {
          if (row.name !== oldDoc.name) {
            // rename
            oldDoc.isActive = false;
            await oldDoc.save();
            await logDisable(
              row.type,
              oldDoc._id,
              oldDoc.name,
              restaurantId,
              userId,
              userName,
              userRole,
              importBatchId
            );

            const newDoc = await createNewDoc(
              row,
              lineIndex,
              importBatchId,
              restaurantId,
              errors
            );
            if (newDoc) {
              await logRename(
                row.type,
                oldDoc._id,
                oldDoc.name,
                row.name,
                restaurantId,
                userId,
                userName,
                userRole,
                importBatchId
              );
              await logCreate(
                row.type,
                newDoc._id,
                newDoc.name,
                restaurantId,
                userId,
                userName,
                userRole,
                importBatchId
              );
            }
          } else {
            // partial update
            const changesArr = await updateDocFields(oldDoc, row);
            // remove from unused
            unusedDocs.delete(oldDoc._id.toString());
            if (changesArr && changesArr.length > 0) {
              await logUpdate(
                row.type,
                oldDoc._id,
                oldDoc.name,
                restaurantId,
                userId,
                userName,
                userRole,
                changesArr,
                importBatchId
              );
            }
          }
          successCount++;
        } else {
          // brand new doc in that row
          const newDoc = await createNewDoc(
            row,
            lineIndex,
            importBatchId,
            restaurantId,
            errors
          );
          if (newDoc) {
            await logCreate(
              row.type,
              newDoc._id,
              newDoc.name,
              restaurantId,
              userId,
              userName,
              userRole,
              importBatchId,
              false // not first import
            );
          }
          successCount++;
        }
      } catch (err) {
        failCount++;
        errors.push(`Row error (line ${lineIndex}): ${err.message}`);
      }
    }

    // 3) disable leftover docs
    for (const docId of unusedDocs) {
      let doc = await Service.findById(docId);
      if (doc && doc.isActive) {
        doc.isActive = false;
        await doc.save();
        await logDisable(
          "service",
          doc._id,
          doc.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
        continue;
      }
      doc = await Category.findById(docId);
      if (doc && doc.isActive) {
        doc.isActive = false;
        await doc.save();
        await logDisable(
          "category",
          doc._id,
          doc.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
        continue;
      }
      doc = await MenuItem.findById(docId);
      if (doc && doc.isActive) {
        doc.isActive = false;
        await doc.save();
        await logDisable(
          "item",
          doc._id,
          doc.name,
          restaurantId,
          userId,
          userName,
          userRole,
          importBatchId
        );
        continue;
      }
    }
  } catch (err) {
    errors.push(`General import error: ${err.message}`);
  }

  return {
    rowCount,
    successCount,
    failCount,
    errors,
    importBatchId,
  };
}

// create doc for a brand-new row
async function createNewDoc(
  row,
  lineIndex,
  importBatchId,
  restaurantId,
  errors
) {
  if (row.type === "service") {
    const svc = new Service({
      restaurantId,
      name: row.name,
      description: row.description || "",
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "service",
      importLine: lineIndex,
    });
    await svc.save();
    return svc;
  } else if (row.type === "category") {
    if (!row.serviceName) {
      throw new Error(`Category row missing serviceName => ${row.name}`);
    }
    let parentSvc = await Service.findOne({
      restaurantId,
      name: row.serviceName,
    });
    if (!parentSvc) {
      parentSvc = new Service({
        restaurantId,
        name: row.serviceName,
        importBatch: importBatchId,
        importType: "service",
        importLine: null,
      });
      await parentSvc.save();
    }
    const cat = new Category({
      serviceId: parentSvc._id,
      name: row.name,
      description: row.description || "",
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "category",
      importLine: lineIndex,
    });
    await cat.save();
    return cat;
  } else if (row.type === "item") {
    if (!row.categoryName) {
      throw new Error(`Item row missing categoryName => ${row.name}`);
    }
    let catDoc = await Category.findOne({ name: row.categoryName }).populate(
      "serviceId"
    );
    if (!catDoc) {
      catDoc = new Category({
        name: row.categoryName,
        importBatch: importBatchId,
        importType: "category",
        importLine: null,
      });
      await catDoc.save();
    }
    const itemDoc = new MenuItem({
      categoryId: catDoc._id,
      name: row.name,
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "item",
      importLine: lineIndex,
      price: row.price ?? 0,
      description: row.description || "",
      vegNonVeg: row.vegNonVeg || "veg",
      portionInfo: row.portionInfo || "",
      nutritionalInfo: {
        calories: row.calories ?? 0,
        protein: row.protein ?? 0,
        carbs: row.carbs ?? 0,
        fat: row.fat ?? 0,
      },
      allergens: row.allergens ? row.allergens.split(",") : [],
      ingredients: row.ingredients ? row.ingredients.split(",") : [],
      imageUrl: row.imageUrl || "",
      available: row.available !== false,
      isSpecial: row.isSpecial === true,
    });
    await itemDoc.save();
    return itemDoc;
  } else {
    throw new Error(`Unknown row type '${row.type}'`);
  }
}

// update subfields => return array of {field, oldValue, newValue}
async function updateDocFields(doc, row) {
  const changes = [];
  if (doc.importType === "service") {
    if (row.description && row.description !== doc.description) {
      changes.push({
        field: "description",
        oldValue: doc.description,
        newValue: row.description,
      });
      doc.description = row.description;
    }
    await doc.save();
  } else if (doc.importType === "category") {
    if (row.description && row.description !== doc.description) {
      changes.push({
        field: "description",
        oldValue: doc.description,
        newValue: row.description,
      });
      doc.description = row.description;
    }
    await doc.save();
  } else if (doc.importType === "item") {
    const oldPrice = doc.price;
    if (row.price != null && row.price !== doc.price) {
      changes.push({
        field: "price",
        oldValue: doc.price,
        newValue: row.price,
      });
      doc.price = row.price;
    }
    if (row.description && row.description !== doc.description) {
      changes.push({
        field: "description",
        oldValue: doc.description,
        newValue: row.description,
      });
      doc.description = row.description;
    }
    if (row.vegNonVeg && row.vegNonVeg !== doc.vegNonVeg) {
      changes.push({
        field: "vegNonVeg",
        oldValue: doc.vegNonVeg,
        newValue: row.vegNonVeg,
      });
      doc.vegNonVeg = row.vegNonVeg;
    }
    if (row.portionInfo && row.portionInfo !== doc.portionInfo) {
      changes.push({
        field: "portionInfo",
        oldValue: doc.portionInfo,
        newValue: row.portionInfo,
      });
      doc.portionInfo = row.portionInfo;
    }
    // nutritional
    if (row.calories != null && row.calories !== doc.nutritionalInfo.calories) {
      changes.push({
        field: "calories",
        oldValue: doc.nutritionalInfo.calories,
        newValue: row.calories,
      });
      doc.nutritionalInfo.calories = row.calories;
    }
    if (row.protein != null && row.protein !== doc.nutritionalInfo.protein) {
      changes.push({
        field: "protein",
        oldValue: doc.nutritionalInfo.protein,
        newValue: row.protein,
      });
      doc.nutritionalInfo.protein = row.protein;
    }
    if (row.carbs != null && row.carbs !== doc.nutritionalInfo.carbs) {
      changes.push({
        field: "carbs",
        oldValue: doc.nutritionalInfo.carbs,
        newValue: row.carbs,
      });
      doc.nutritionalInfo.carbs = row.carbs;
    }
    if (row.fat != null && row.fat !== doc.nutritionalInfo.fat) {
      changes.push({
        field: "fat",
        oldValue: doc.nutritionalInfo.fat,
        newValue: row.fat,
      });
      doc.nutritionalInfo.fat = row.fat;
    }
    // allergens
    if (row.allergens) {
      const newAllergens = row.allergens.split(",");
      if (JSON.stringify(newAllergens) !== JSON.stringify(doc.allergens)) {
        changes.push({
          field: "allergens",
          oldValue: doc.allergens,
          newValue: newAllergens,
        });
        doc.allergens = newAllergens;
      }
    }
    // ingredients
    if (row.ingredients) {
      const newIngr = row.ingredients.split(",");
      if (JSON.stringify(newIngr) !== JSON.stringify(doc.ingredients)) {
        changes.push({
          field: "ingredients",
          oldValue: doc.ingredients,
          newValue: newIngr,
        });
        doc.ingredients = newIngr;
      }
    }
    if (row.imageUrl && row.imageUrl !== doc.imageUrl) {
      changes.push({
        field: "imageUrl",
        oldValue: doc.imageUrl,
        newValue: row.imageUrl,
      });
      doc.imageUrl = row.imageUrl;
    }
    if (row.available != null) {
      const newAvail = row.available !== false;
      if (newAvail !== doc.available) {
        changes.push({
          field: "available",
          oldValue: doc.available,
          newValue: newAvail,
        });
        doc.available = newAvail;
      }
    }
    if (row.isSpecial != null) {
      const newSpec = row.isSpecial === true;
      if (newSpec !== doc.isSpecial) {
        changes.push({
          field: "isSpecial",
          oldValue: doc.isSpecial,
          newValue: newSpec,
        });
        doc.isSpecial = newSpec;
      }
    }
    await doc.save();
  }
  return changes;
}

module.exports = {
  bulkImport,
  bulkMergeUpdate,
};
