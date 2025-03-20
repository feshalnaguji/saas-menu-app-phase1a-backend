// src/models/Restaurant.js

const mongoose = require("mongoose");
const shortid = require("shortid"); // or nanoid

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
    },
    gstNumber: {
      type: String,
      default: "",
    },
    fssaiLicense: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    openTime: {
      type: String,
      default: "",
    },
    closeTime: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slug: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

// Generate slug on creation
RestaurantSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = shortid.generate();
  }
  next();
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
