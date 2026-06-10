# COMPLETE SYSTEM SOURCE CODE
## CAR RENTAL & DRIVER MANAGEMENT SYSTEM (EASY RENTALS)
**This document contains the absolute, production-grade, complete source code files for each and every logical block, file, and function used in the system.**

---

## PART A: BACKEND CODE (EXPRESS.JS & MONGODB)

### 1. Server Launcher & Middleware Integrator
* **File Path:** `car-rental-backend/server.js`
* **Purpose:** Initial server configuration, CORS initialization, request logger, API routing bindings, database serverless gateway middleware, and unhandled global error catches.

```javascript
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

// ─── CORS Configuration ──────────────────────────────────────────────────────
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

// ─── JSON and Form Parsers ────────────────────────────────────────────────────
// High threshold to support direct base64 image transmissions
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Server Health Route ──────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Car Rental API is running 🚗" });
});

// ─── MongoDB Connection Layer ──────────────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("❌ Database connection error in request middleware:", err.message);
    next(err);
  }
});

// ─── Endpoint Registry ────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);

// ─── Unhandled Error Boundary Exception Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ─── Startup Daemon ──────────────────────────────────────────────────────────
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
```

---

### 2. Database Adapter Connection
* **File Path:** `car-rental-backend/db.js`
* **Purpose:** Handles MongoDB connection pooling and caches the instance reference globally to achieve optimized response profiles in serverless hosting architectures.

```javascript
const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI in .env");
    }
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        family: 4, // Forces IPv4 lookup to bypass local DNS resolution latency
      })
      .then((m) => {
        console.log("✅ MongoDB connected successfully");
        return m;
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectToDatabase;
```

---

### 3. Identity & Credentials Security Model
* **File Path:** `car-rental-backend/models/User.js`
* **Purpose:** Establishes schemas for User accounts and enforces automatic BcryptJS hashing controls on passwords during saving loops.

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "driver"],
      default: "customer",
    },
  },
  { timestamps: true }
);

// Pre-Save Hook: Encrypts the raw password if it has been updated
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance Hook: Compares candidate passwords during authentication requests
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
```

---

### 4. Vehicle Profile Database Schema Model
* **File Path:** `car-rental-backend/models/Vehicle.js`
* **Purpose:** Defines Mongoose models for vehicles, storing driver ownership links, specific rental classifications, locations, pricing details, and base64 graphic vectors.

```javascript
const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driverName: { type: String, required: false, trim: true },
    carName: { type: String, required: true, trim: true },
    carNo: { type: String, required: false, trim: true },
    aadharNo: { type: String, required: false },
    license: { type: String, required: false },
    experience: { type: Number, required: false, min: 0 },
    phone: { type: String, required: false },
    purpose: {
      type: String,
      enum: ["cab", "trip", "events"],
      required: false,
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    photo: { type: String, default: "" }, // Base64 encoded string payload
    withDriver: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
```

---

### 5. Booking Order Database Schema Model
* **File Path:** `car-rental-backend/models/Booking.js`
* **Purpose:** Manages customers' rental reservations, storing pickup/drop locations, geo-coordinates, booking dates, identity documents, and dynamic expiry durations.

```javascript
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    purpose: {
      type: String,
      enum: ["cab", "trip", "events"],
      required: true,
    },
    pickupLocation: { type: String },
    dropLocation: { type: String },
    pickupCoords: {
      lat: { type: String },
      lon: { type: String },
    },
    dropCoords: {
      lat: { type: String },
      lon: { type: String },
    },
    bookingDate: { type: String, required: true },
    pickupTime: { type: String },
    withDriver: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerLicense: { type: String, default: "" },
    customerAadhar: { type: String, default: "" },
    driverPhone: { type: String, default: "" },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
module.exports = Booking;
```

---

### 6. User Verification & Authorization Guards
* **File Path:** `car-rental-backend/middleware/auth.js`
* **Purpose:** Provides middleware layers for extracting JWTs from request headers or cookies, parsing signatures, and validating user permission scopes (role checks).

```javascript
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
```

---

### 7. User Registration & Session Router
* **File Path:** `car-rental-backend/routes/auth.js`
* **Purpose:** Exposes endpoints for user registration, user logins, and profile fetches.

```javascript
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const router = express.Router();

/** Generate JWT token */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

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

    // Check if email already in use
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role === "driver" ? "driver" : "customer",
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
```

---

### 8. Fleet Registration & Search Filter Controller Router
* **File Path:** `car-rental-backend/routes/vehicles.js`
* **Purpose:** Implements CRUD actions on driver vehicles and integrates the highly intelligent multi-word location substring overlap parsing engine.

```javascript
const express = require("express");
const Vehicle = require("../models/Vehicle");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

/**
 * @route  GET /api/vehicles
 * @desc   Get all vehicles (optionally filter by purpose)
 * @access Private (JWT)
 */
router.get("/", protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.purpose) {
      filter.purpose = req.query.purpose;
    }
    if (req.query.withDriver) {
      filter.withDriver = req.query.withDriver === "true";
    }
    let vehicles = await Vehicle.find(filter)
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });

    console.log(`[API /vehicles] Total vehicles fetched: ${vehicles.length}. Filter:`, filter);
    console.log(`[API /vehicles] Received pickupLocation query: "${req.query.pickupLocation}"`);

    if (req.query.pickupLocation) {
      const queryLoc = req.query.pickupLocation.toLowerCase().trim();
      vehicles = vehicles.filter((vehicle) => {
        if (!vehicle.location) return false;
        const vehicleLoc = vehicle.location.toLowerCase().trim();

        // 1. Check if vehicle location is a substring of pickup location or vice-versa
        const isSubstring = vehicleLoc.includes(queryLoc) || queryLoc.includes(vehicleLoc);
        
        // 2. Keyword overlap check for multi-word locations (e.g., "Kolkata" matching "Salt Lake, Kolkata")
        const queryWords = queryLoc.split(/[\s,.-]+/).filter((w) => w.length > 2);
        const vehicleWords = vehicleLoc.split(/[\s,.-]+/).filter((w) => w.length > 2);
        const hasOverlap = queryWords.some((qw) =>
          vehicleWords.some((vw) => vw.includes(qw) || qw.includes(vw))
        );

        const matched = isSubstring || hasOverlap;
        console.log(`[Filtering] Vehicle "${vehicle.carName}" location: "${vehicle.location}" vs Query: "${queryLoc}". Matched: ${matched}`);
        return matched;
      });
      console.log(`[API /vehicles] Vehicles after location filter: ${vehicles.length}`);
    }

    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  GET /api/vehicles/my
 * @desc   Get vehicles belonging to the logged-in driver
 * @access Private (driver only)
 */
router.get("/my", protect, restrictTo("driver"), async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ driverId: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  POST /api/vehicles
 * @desc   Add a new vehicle (driver only)
 * @access Private (driver only)
 */
router.post("/", protect, restrictTo("driver"), async (req, res) => {
  try {
    const {
      driverName,
      carName,
      carNo,
      aadharNo,
      license,
      experience,
      phone,
      purpose,
      price,
      location,
      photo,
    } = req.body;

    const vehicle = await Vehicle.create({
      driverId: req.user._id,
      driverName,
      carName,
      carNo,
      aadharNo,
      license,
      experience: experience ? Number(experience) : undefined,
      phone,
      purpose,
      price: price ? Number(price) : 0,
      location,
      photo: photo || "",
      withDriver: req.body.withDriver === true || req.body.withDriver === "true",
    });

    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    console.error("Add vehicle error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  PUT /api/vehicles/:id
 * @desc   Update a vehicle (driver owner only)
 * @access Private (driver only)
 */
router.put("/:id", protect, restrictTo("driver"), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      driverId: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or you do not own this vehicle.",
      });
    }

    const allowedFields = [
      "driverName",
      "carName",
      "carNo",
      "aadharNo",
      "license",
      "experience",
      "phone",
      "purpose",
      "price",
      "location",
      "photo",
      "withDriver",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field];
      }
    });

    await vehicle.save();
    res.status(200).json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route  DELETE /api/vehicles/:id
 * @desc   Delete a vehicle (driver owner only)
 * @access Private (driver only)
 */
router.delete("/:id", protect, restrictTo("driver"), async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      driverId: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found or you do not own this vehicle.",
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Vehicle deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
```

---

### 9. Asynchronous Booking Lifecycle & Expiry Engine Router
* **File Path:** `car-rental-backend/routes/bookings.js`
* **Purpose:** Handles all booking reservations, sends real-time transactional SMS alerts via Fast2SMS, executes the 5-minute timeout loop, and runs the GDPR-compliant 24-hour cleanup engine.

```javascript
const express = require("express");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─── Fast2SMS helper (free, Indian numbers) ──────────────────────────────────
async function sendSMS(to, body) {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log(`[SMS skipped - no Fast2SMS config] To: ${to}\n${body}`);
      return;
    }
    const axios = require("axios");
    // Strip country code if present, Fast2SMS needs 10-digit Indian number
    const mobile = to.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      { route: "q", message: body, language: "english", flash: 0, numbers: mobile },
      { headers: { authorization: process.env.FAST2SMS_API_KEY } }
    );
  } catch (err) {
    console.error("SMS error:", err.message);
  }
}

// ─── Booking Cleanup helper (deletes bookings older than 24 hours) ─────────────
async function cleanupOldBookings() {
  try {
    const now = new Date();
    const hrs24Ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Format YYYY-MM-DD for yesterday
    const yyyy = hrs24Ago.getFullYear();
    const mm = String(hrs24Ago.getMonth() + 1).padStart(2, "0");
    const dd = String(hrs24Ago.getDate()).padStart(2, "0");
    const yesterdayStr = `${yyyy}-${mm}-${dd}`;

    const result = await Booking.deleteMany({
      $or: [
        // 1. Confirmed/rejected/cancelled status updated more than 24 hours ago
        { status: { $in: ["confirmed", "rejected", "cancelled"] }, updatedAt: { $lt: hrs24Ago } },
        // 2. Expired pending bookings (where expiresAt is older than 24 hours ago)
        { status: "pending", expiresAt: { $lt: hrs24Ago } },
        // 3. Booking date is older than 24 hours (bookingDate string is less than yesterday's date string)
        { bookingDate: { $lt: yesterdayStr } }
      ]
    });
    if (result.deletedCount > 0) {
      console.log(`[Cleanup] Deleted ${result.deletedCount} old bookings.`);
    }
  } catch (err) {
    console.error("[Cleanup Error] Failed to delete old bookings:", err.message);
  }
}

// ─── GET /api/bookings/driver ─────────────────────────────────────────────────
router.get("/driver", protect, restrictTo("driver"), async (req, res) => {
  try {
    await cleanupOldBookings();

    const driverVehicles = await Vehicle.find({ driverId: req.user._id }).select("_id");
    const vehicleIds = driverVehicles.map((v) => v._id);

    const bookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      status: { $in: ["pending", "confirmed", "rejected", "cancelled"] },
    })
      .populate("vehicleId")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/bookings ────────────────────────────────────────────────────────
router.get("/", protect, restrictTo("customer", "driver"), async (req, res) => {
  try {
    await cleanupOldBookings();

    const bookings = await Booking.find({ customerId: req.user._id })
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/bookings ───────────────────────────────────────────────────────
router.post("/", protect, restrictTo("customer", "driver"), async (req, res) => {
  try {
    const {
      vehicleId, purpose, pickupLocation, dropLocation,
      pickupCoords, dropCoords, bookingDate, pickupTime,
      withDriver, customerName, customerPhone, customerLicense, customerAadhar,
    } = req.body;

    if (!vehicleId || !purpose || !bookingDate) {
      return res.status(400).json({ success: false, message: "Missing required booking fields." });
    }

    const isSelfDrive = (purpose === "trip" || purpose === "events") && withDriver === "without-driver";
    if (!isSelfDrive && (!pickupLocation || !dropLocation)) {
      return res.status(400).json({ success: false, message: "Pickup and drop locations are required." });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found." });

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const booking = await Booking.create({
      customerId: req.user._id,
      vehicleId,
      purpose,
      pickupLocation: pickupLocation || "",
      dropLocation: dropLocation || "",
      pickupCoords: pickupCoords || {},
      dropCoords: dropCoords || {},
      bookingDate,
      pickupTime: pickupTime || "",
      withDriver: withDriver || "",
      status: "pending",
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerLicense: customerLicense || "",
      customerAadhar: customerAadhar || "",
      driverPhone: vehicle.phone || "",
      expiresAt,
    });

    await booking.populate("vehicleId");

    // SMS to customer
    if (customerPhone) {
      const driverInfo = vehicle.withDriver
        ? `Driver: ${vehicle.driverName || "N/A"} | Phone: ${vehicle.phone || "N/A"} | License: ${vehicle.license || "N/A"} | Experience: ${vehicle.experience || "N/A"} yrs`
        : "Self Drive";

      const msg =
        `Booking Request Sent!\n` +
        `Car: ${vehicle.carName} (${vehicle.carNo || ""})\n` +
        `Purpose: ${purpose}\n` +
        `Date: ${bookingDate}\n` +
        (pickupTime ? `Pickup Time: ${pickupTime}\n` : "") +
        (pickupLocation ? `From: ${pickupLocation}\n` : "") +
        (dropLocation ? `To: ${dropLocation}\n` : "") +
        `${driverInfo}\n` +
        `Price: ₹${vehicle.price}${purpose === "cab" ? "/km" : "/day"}\n` +
        `Status: Waiting for driver confirmation...`;

      await sendSMS(customerPhone, msg);
    }

    // SMS to driver
    if (vehicle.phone) {
      const msg =
        `New Booking Request!\n` +
        `Customer: ${customerName || req.user.name}\n` +
        `Phone: ${customerPhone || "N/A"}\n` +
        `Car: ${vehicle.carName}\n` +
        `Date: ${bookingDate}\n` +
        (pickupLocation ? `From: ${pickupLocation}\n` : "") +
        (dropLocation ? `To: ${dropLocation}\n` : "") +
        `Please accept or reject within 5 minutes on the website.`;

      await sendSMS(vehicle.phone, msg);
    }

    res.status(201).json({ success: true, message: "Booking request sent! Waiting for driver confirmation.", booking });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

// ─── PATCH /api/bookings/:id/respond ─────────────────────────────────────────
router.patch("/:id/respond", protect, restrictTo("driver"), async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be accept or reject." });
    }

    const booking = await Booking.findById(req.params.id).populate("vehicleId");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    // Verify this driver owns the vehicle
    const vehicle = await Vehicle.findOne({ _id: booking.vehicleId, driverId: req.user._id });
    if (!vehicle) return res.status(403).json({ success: false, message: "Not authorized." });

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking already responded to." });
    }

    // Check if expired
    if (booking.expiresAt && new Date() > booking.expiresAt) {
      booking.status = "rejected";
      await booking.save();
      if (booking.customerPhone) {
        await sendSMS(booking.customerPhone, `Sorry, the driver did not respond in time. Your booking for ${booking.vehicleId?.carName} has been automatically rejected. Please find another vehicle. Thank you.`);
      }
      return res.status(400).json({ success: false, message: "Booking has expired." });
    }

    booking.status = action === "accept" ? "confirmed" : "rejected";
    await booking.save();

    // SMS to customer
    if (booking.customerPhone) {
      const msg = action === "accept"
        ? `Great news! Your booking for ${booking.vehicleId?.carName} on ${booking.bookingDate} has been confirmed by the driver. Have a great ride!`
        : `We're sorry. The driver has rejected your booking for ${booking.vehicleId?.carName} on ${booking.bookingDate}. Please find another vehicle. Thank you.`;
      await sendSMS(booking.customerPhone, msg);
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/bookings/expire ────────────────────────────────────────────────
// Called by frontend polling to auto-reject expired pending bookings
router.post("/expire", protect, async (req, res) => {
  try {
    const expired = await Booking.find({
      status: "pending",
      expiresAt: { $lt: new Date() },
    }).populate("vehicleId");

    for (const booking of expired) {
      booking.status = "rejected";
      await booking.save();
      if (booking.customerPhone) {
        await sendSMS(
          booking.customerPhone,
          `Sorry, the driver did not respond within 5 minutes. Your booking for ${booking.vehicleId?.carName} has been automatically rejected. Please find another vehicle. Thank you.`
        );
      }
    }

    res.status(200).json({ success: true, expired: expired.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/bookings/:id ─────────────────────────────────────────────────
router.delete("/:id", protect, restrictTo("customer", "driver"), async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, customerId: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ success: true, message: "Booking cancelled successfully.", booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
```

---

## PART B: FRONTEND CODE (NEXT.JS 15+ & REACT 19)

### 1. Unified Route Shield Guards Middleware
* **File Path:** `middleware.ts`
* **Purpose:** Intercepts route requests inside client browsers, checking authorization cookies and role flags to ensure strict URL access permissions.

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_CUSTOMER_ROUTES = [
  "/customer-dashboard",
  "/book-car",
  "/my-bookings",
  "/available-vehicles",
];

const PROTECTED_DRIVER_ROUTES = [
  "/driver-dashboard",
  "/driver",
  "/my-vehicles",
  "/driver-bookings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isCustomerRoute = PROTECTED_CUSTOMER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isDriverRoute = PROTECTED_DRIVER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if ((isCustomerRoute || isDriverRoute) && !token) {
    return NextResponse.redirect(new URL("/role-selection", request.url));
  }

  if (isCustomerRoute && userRole === "driver") {
    return NextResponse.redirect(new URL("/driver-dashboard", request.url));
  }

  if (isDriverRoute && userRole === "customer") {
    return NextResponse.redirect(new URL("/customer-dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer-dashboard/:path*",
    "/driver-dashboard/:path*",
    "/driver/:path*",
    "/my-vehicles/:path*",
    "/driver-bookings/:path*",
    "/book-car/:path*",
    "/my-bookings/:path*",
    "/available-vehicles/:path*",
  ],
};
```

---

### 2. Client Role Selection Visual Component
* **File Path:** `app/role-selection/page.tsx`
* **Purpose:** Visual portal router allowing customers and drivers to step into their respective registration/authentication gates.

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function RoleSelection() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-20 p-6">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Choose Your Role</h1>
        <p className="text-gray-300 text-base">Select how you want to continue</p>
      </div>
      <div className="relative z-10 flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        {/* Customer Card */}
        <button
          onClick={() => router.push("/login/user")}
          className="group flex-1 text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 border border-blue-100"
        >
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Customer</h2>
                <p className="text-sm text-gray-500">Book a ride</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  ),
                  text: "Browse available vehicles"
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                  text: "Manage your bookings"
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  text: "Track pickup & drop"
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-blue-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
              Login as Customer
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </button>

        {/* Driver Card */}
        <button
          onClick={() => router.push("/login/admin")}
          className="group flex-1 text-left bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 active:scale-95 border border-purple-100"
        >
          <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Driver</h2>
                <p className="text-sm text-gray-500">Manage your fleet</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                  text: "Register your vehicles"
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  text: "Set pricing & availability"
                },
                {
                  icon: (
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                  text: "View all bookings"
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-1.5 text-purple-600 font-semibold text-sm group-hover:gap-2.5 transition-all">
              Login as Driver
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
```

---

### 3. Customer Navigation Dashboard Component
* **File Path:** `app/customer-dashboard/page.tsx`
* **Purpose:** Dynamic customer panel that lists clear visual gateways to book rides or browse reservation histories.

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f0c29ee 0%, #302b63ee 50%, #24243eee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-white">Customer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Book Your Vehicle */}
          <div
            onClick={() => router.push("/book-car")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="flex items-center justify-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Book Your Vehicle</h2>
            <p className="text-gray-500 text-center text-sm">Find and book available cars instantly</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-blue-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* My Bookings */}
          <div
            onClick={() => router.push("/my-bookings")}
            className="cursor-pointer bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="flex items-center justify-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">My Bookings</h2>
            <p className="text-gray-500 text-center text-sm">View and manage your ride history</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View All
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. Driver Navigation Dashboard Component
* **File Path:** `app/driver-dashboard/page.tsx`
* **Purpose:** Interface hosting control links for drivers to register/edit their listed cars and confirm or reject passenger requests.

```typescript
"use client";

import { useRouter } from "next/navigation";

export default function DriverDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center pt-24 p-10">
      <div className="absolute inset-0 z-0">
        <img src="/Car.png" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1f053aee 0%, #3b0066ee 50%, #0d001aee 100%)" }}></div>
      </div>
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }}></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}></div>
      </div>
      <div className="relative z-10 max-w-4xl w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-white font-sans tracking-wide">Driver Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Manage Vehicles */}
          <div
            onClick={() => router.push("/my-vehicles")}
            className="cursor-pointer bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group border border-purple-100"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Manage Vehicles</h2>
            <p className="text-gray-500 text-center text-sm">Add or edit your listed vehicle profiles</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-purple-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Configure Vehicles
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Ride Booking Requests */}
          <div
            onClick={() => router.push("/driver-bookings")}
            className="cursor-pointer bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 active:scale-95 group border border-pink-100"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">Ride Bookings</h2>
            <p className="text-gray-500 text-center text-sm">Review incoming passenger booking alerts</p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-pink-600 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              View Requests
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
