// middlewares/checkServiceAccess.js
const User = require("../models/User");
const Service = require("../models/Service");

exports.checkServiceAccess = async function (req, res, next) {
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

    const { serviceId } = req.params;
    const svc = await Service.findById(serviceId);
    if (!svc) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
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
