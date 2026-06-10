const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // fallback Mongoose model
const { protect } = require("../middleware/auth");
const storage = require("../lib/storage");

const router = express.Router();

/** Generate JWT token */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const useJson = process.env.USE_JSON_STORAGE === "true";

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user (customer or driver)
 * @access Public
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
    }

    // Check if email already exists
    let existing;
    if (useJson) {
      existing = await storage.findUserByEmail(email);
    } else {
      existing = await User.findOne({ email: email.toLowerCase() });
    }
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: role === "driver" ? "driver" : "customer",
    };

    const user = useJson ? await storage.createUser(userData) : await User.create(userData);
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  POST /api/auth/login
 * @desc   Login user, return JWT token
 * @access Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = useJson ? await storage.findUserByEmail(email) : await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = useJson ? storage.comparePassword(user.password, password) : await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user._id);
    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  GET /api/auth/me
 * @desc   Get current logged-in user profile
 * @access Private (JWT required)
 */
router.get("/me", protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
