const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1. Try Authorization header first
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fallback: read token from cookie
    if (!token && req.headers.cookie) {
      const cookies = Object.fromEntries(
        req.headers.cookie.split(";").map((c) => {
          const [k, ...v] = c.trim().split("=");
          return [k.trim(), v.join("=")];
        })
      );
      token = cookies["token"] || null;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token." });
  }
};

/**
 * Middleware: Restrict access to specific roles
 * Usage: restrictTo('driver')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for: ${roles.join(", ")} only.`,
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
