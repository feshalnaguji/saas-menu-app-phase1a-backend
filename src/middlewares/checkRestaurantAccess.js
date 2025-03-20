// middlewares/checkRestaurantAccess.js
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

exports.checkRestaurantAccess = async function (req, res, next) {
  try {
    // If superadmin => skip
    if (req.user.role === "superadmin") return next();

    // Must be admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden for non-admin" });
    }

    // find the user doc
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User not found" });
    }

    // The route param
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // Check if assigned
    if (
      !user.assignedRestaurants.map(String).includes(String(restaurant._id))
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not assigned to this restaurant" });
    }

    return next();
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
