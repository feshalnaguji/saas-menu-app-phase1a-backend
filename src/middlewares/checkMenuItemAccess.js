// middlewares/checkMenuItemAccess.js
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Service = require("../models/Service");

exports.checkMenuItemAccess = async function (req, res, next) {
  try {
    if (req.user.role === "superadmin") return next();
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden for non-admin" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    const { menuItemId } = req.params;
    const item = await MenuItem.findById(menuItemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }

    const cat = await Category.findById(item.categoryId);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Parent category not found" });
    }
    const svc = await Service.findById(cat.serviceId);
    if (!svc) {
      return res
        .status(404)
        .json({ success: false, message: "Parent service not found" });
    }
    if (
      !user.assignedRestaurants.map(String).includes(String(svc.restaurantId))
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not assigned to that restaurant" });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
