// src/middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
  token = header.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    const userDoc = await User.findById(decoded.userId);
    if (!userDoc) {
      return res.status(401).json({ success: false, message: "No user found" });
    }

    // attach to req.user
    req.user = {
      userId: userDoc._id.toString(),
      name: userDoc.name || "",
      role: userDoc.role,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Token invalid" });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};
