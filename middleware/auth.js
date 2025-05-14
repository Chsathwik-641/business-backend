const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      console.log("Token extracted from header:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("User from token:", req.user);

      if (!req.user) {
        console.log("User not found after decoding token");
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      next();
    } catch (error) {
      console.error("Error in token verification:", error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    console.log("No token in authorization header");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    console.log("Not authorized as an admin. User role:", req.user?.role);
    res.status(403);
    throw new Error("Not authorized as an admin");
  }
};

const manager = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    next();
  } else {
    console.log(
      "Not authorized as a manager or admin. User role:",
      req.user?.role
    );
    res.status(403);
    throw new Error("Not authorized as a manager or admin");
  }
};

module.exports = { protect, admin, manager };
