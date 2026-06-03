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

    // Directly query bookings associated with this driver via driverId field
    const bookings = await Booking.find({
      driverId: req.user._id,
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

    // Fetch vehicle to get driverId for direct association
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found." });
    const driverId = vehicle.driverId;

    if (!vehicleId || !purpose || !bookingDate) {
      return res.status(400).json({ success: false, message: "Missing required booking fields." });
    }

    const isSelfDrive = (purpose === "trip" || purpose === "events") && withDriver === "without-driver";
    if (!isSelfDrive && (!pickupLocation || !dropLocation)) {
      return res.status(400).json({ success: false, message: "Pickup and drop locations are required." });
    }



    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const booking = await Booking.create({
      customerId: req.user._id,
      vehicleId,
      driverId,
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
