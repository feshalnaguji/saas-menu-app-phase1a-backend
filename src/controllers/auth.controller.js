// controllers/auth.controller.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate a JWT token
function generateToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1d" }
  );
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, role, assignedRestaurants }
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, assignedRestaurants } = req.body;

    // Check if email is already used
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    }

    // If the request wants to create an admin, ensure the logged-in user is superadmin
    if (role === "admin") {
      // The user creating this must be superadmin
      if (req.user.role !== "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Only superadmin can create admin users",
        });
      }
    }

    // If role=superadmin, also ensure that the request user is superadmin
    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmin can create another superadmin",
      });
    }

    user = new User({
      name,
      email,
      password,
      role: role || "user",
      assignedRestaurants: assignedRestaurants || [],
    });
    await user.save();

    const token = generateToken(user);
    return res.status(201).json({ success: true, data: { token, user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = generateToken(user);
    return res.json({ success: true, data: { token, user } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
