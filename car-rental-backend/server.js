require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./db");

// Route imports
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const bookingRoutes = require("./routes/bookings");

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.url}`);
  next();
});

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

// ─── Body parsers ─────────────────────────────────────────────────────────────
// Increase limit for base64 photo uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Car Rental API is running 🚗" });
});

// ─── Database connection middleware for Vercel/serverless environments ──────────
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("❌ Database connection error in request middleware:", err.message);
    next(err);
  }
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Car Rental API running on http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to connect to MongoDB:", err.message);
      process.exit(1);
    });
}

module.exports = app;
