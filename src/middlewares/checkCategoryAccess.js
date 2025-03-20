// middlewares/checkCategoryAccess.js
const User = require("../models/User");
const Category = require("../models/Category");
const Service = require("../models/Service");

exports.checkCategoryAccess = async function (req, res, next) {
  try {
    if (req.user.role === "superadmin") return next();
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    const { categoryId } = req.params;
    const cat = await Category.findById(categoryId);
    if (!cat) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // find the service
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
