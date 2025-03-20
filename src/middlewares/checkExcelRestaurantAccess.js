// middlewares/checkExcelRestaurantAccess.js
const User = require("../models/User");

exports.checkExcelRestaurantAccess = async function (req, res, next) {
  try {
    if (req.user.role === "superadmin") return next();
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { restaurantId } = req.body;
    if (!restaurantId) {
      return res
        .status(400)
        .json({ success: false, message: "No restaurantId in body" });
    }

    const user = await User.findById(req.user.userId);
    if (!user)
      return res
        .status(403)
        .json({ success: false, message: "User not found" });

    if (!user.assignedRestaurants.map(String).includes(String(restaurantId))) {
      return res
        .status(403)
        .json({ success: false, message: "Not assigned to that restaurant" });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
