// src/models/MenuItem.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const MenuItemSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    vegNonVeg: {
      type: String,
      enum: ["veg", "non-veg", "vegan"],
      default: "veg",
    },
    portionInfo: {
      type: String,
      default: "", // e.g. "Half", "Full", "Serves 2"
    },
    nutritionalInfo: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    allergens: {
      type: [String],
      default: [],
    },
    ingredients: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: "",
    },
    available: {
      type: Boolean,
      default: true,
    },
    isSpecial: {
      type: Boolean,
      default: false,
    },
    importBatch: {
      type: String,
      default: "",
    },
    isActive: { type: Boolean, default: true },
    importLine: { type: Number, default: null },
    importType: { type: String, default: "item" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MenuItem", MenuItemSchema);
