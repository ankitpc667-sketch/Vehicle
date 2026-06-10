const express = require("express");
const storage = require("../lib/storage");
const { protect, restrictTo } = require("../middleware/auth");

const useJson = process.env.USE_JSON_STORAGE === "true";

const Vehicle = useJson ? {
  find: (filter) => storage.getAllVehicles(filter),
  findById: (id) => storage.getVehicleById(id),
  create: (data) => storage.createVehicle(data),
  findOne: async (filter) => {
    const all = await storage.getAllVehicles();
    return all.find(v => {
      let match = true;
      if (filter._id) match = match && v._id === filter._id;
      if (filter.driverId) match = match && v.driverId === filter.driverId;
      return match;
    }) || null;
  },
  findOneAndDelete: async (filter) => {
    const all = await storage.getAllVehicles();
    const v = all.find(v => v._id === filter._id && v.driverId === filter.driverId);
    if (!v) return null;
    await storage.deleteVehicle(v._id);
    return v;
  },
} : require("../models/Vehicle");

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
    let vehicles = useJson
      ? await Vehicle.find(filter)
      : await Vehicle.find(filter).populate("driverId", "name email").sort({ createdAt: -1 });
    if (useJson) vehicles = vehicles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
    const all = await Vehicle.find({ driverId: String(req.user._id) });
    const vehicles = all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      driverId: String(req.user._id),
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

    const updated = useJson
      ? await storage.updateVehicle(req.params.id, vehicle)
      : await vehicle.save();
    res.status(200).json({ success: true, vehicle: updated });
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
