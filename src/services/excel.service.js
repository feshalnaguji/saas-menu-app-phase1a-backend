// src/services/excel.service.js
const { v4: uuidv4 } = require("uuid");
const Service = require("../models/Service");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

/**
 * Bulk import
 *
 * @param {Object} importData - { restaurantId, rows: [] }
 *    each element in rows has: { type, serviceName, categoryName, name, price, ... }
 * @param {String} fileName - original filename
 */
async function bulkImport(importData, fileName) {
  const { restaurantId, rows } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // A) Find old services for this restaurant
    const oldServices = await Service.find({ restaurantId }).select("_id");
    const oldServiceIds = oldServices.map((doc) => doc._id);

    // B) Find categories that belong to these service IDs
    const oldCategories = await Category.find({
      serviceId: { $in: oldServiceIds },
    }).select("_id");
    const oldCategoryIds = oldCategories.map((doc) => doc._id);

    // C) Deactivate them
    await Service.updateMany(
      { _id: { $in: oldServiceIds } },
      { $set: { isActive: false } }
    );
    await Category.updateMany(
      { _id: { $in: oldCategoryIds } },
      { $set: { isActive: false } }
    );
    await MenuItem.updateMany(
      { categoryId: { $in: oldCategoryIds } },
      { $set: { isActive: false } }
    );

    const serviceMap = {};
    const categoryMap = {};

    for (const row of rows || []) {
      rowCount++;
      const { type } = row;
      try {
        if (type === "service") {
          const svcDoc = new Service({
            restaurantId,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
          });
          await svcDoc.save();
          serviceMap[row.name] = svcDoc;
          successCount++;
        } else if (type === "category") {
          const svcName = row.serviceName;
          let parentSvc = serviceMap[svcName];
          if (!parentSvc) {
            parentSvc = new Service({
              restaurantId,
              name: svcName,
              importBatch: importBatchId,
            });
            await parentSvc.save();
            serviceMap[svcName] = parentSvc;
          }
          const catDoc = new Category({
            serviceId: parentSvc._id,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
          });
          await catDoc.save();
          categoryMap[row.name] = catDoc;
          successCount++;
        } else if (type === "item") {
          const catName = row.categoryName;
          let parentCat = categoryMap[catName];
          if (!parentCat) {
            parentCat = new Category({
              serviceId: null,
              name: catName,
            });
            await parentCat.save();
            categoryMap[catName] = parentCat;
          }
          const itemDoc = new MenuItem({
            categoryId: parentCat._id,
            name: row.name,
            description: row.description || "",
            price: row.price ?? 0,
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
            importBatch: importBatchId,
          });
          await itemDoc.save();
          successCount++;
        } else {
          failCount++;
          errors.push(`Unknown row type '${type}'`);
        }
      } catch (err) {
        failCount++;
        errors.push(`Row error: ${err.message}`);
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

module.exports = {
  bulkImport,
};
