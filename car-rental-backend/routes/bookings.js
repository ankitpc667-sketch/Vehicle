const express = require("express");
const storage = require("../lib/storage");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

async function sendSMS(to, body) {
  try {
    if (!process.env.FAST2SMS_API_KEY) {
      console.log(`[SMS skipped] To: ${to}\n${body}`);
      return;
    }
    const axios = require("axios");
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

// GET /api/bookings/driver
router.get("/driver", protect, restrictTo("driver"), async (req, res) => {
  try {
    const allBookings = await storage.getAllBookings();
    const bookings = allBookings
      .filter(b => b.driverId === String(req.user._id) && ["pending", "confirmed", "rejected", "cancelled"].includes(b.status))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = await Promise.all(bookings.map(async b => {
      const vehicle = await storage.getVehicleById(b.vehicleId);
      const customer = await storage.findUserById(b.customerId);
      return { ...b, vehicleId: vehicle || b.vehicleId, customer };
    }));
    res.status(200).json({ success: true, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings
router.get("/", protect, restrictTo("customer", "driver"), async (req, res) => {
  try {
    const allBookings = await storage.getAllBookings();
    const bookings = allBookings
      .filter(b => b.customerId === String(req.user._id))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const enriched = await Promise.all(bookings.map(async b => {
      const vehicle = await storage.getVehicleById(b.vehicleId);
      return { ...b, vehicleId: vehicle || b.vehicleId };
    }));
    res.status(200).json({ success: true, bookings: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings
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

    const vehicle = await storage.getVehicleById(String(vehicleId));
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found." });

    const isSelfDrive = (purpose === "trip" || purpose === "events") && withDriver === "without-driver";
    if (!isSelfDrive && (!pickupLocation || !dropLocation)) {
      return res.status(400).json({ success: false, message: "Pickup and drop locations are required." });
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const booking = await storage.createBooking({
      customerId: String(req.user._id),
      vehicleId: String(vehicleId),
      driverId: String(vehicle.driverId),
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

    if (customerPhone) {
      const msg = `Booking Request Sent!\nCar: ${vehicle.carName}\nDate: ${bookingDate}\nStatus: Waiting for driver confirmation...`;
      await sendSMS(customerPhone, msg);
    }
    if (vehicle.phone) {
      const msg = `New Booking Request!\nCustomer: ${customerName || req.user.name}\nCar: ${vehicle.carName}\nDate: ${bookingDate}\nPlease accept or reject within 5 minutes.`;
      await sendSMS(vehicle.phone, msg);
    }

    res.status(201).json({ success: true, message: "Booking request sent! Waiting for driver confirmation.", booking });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

// PATCH /api/bookings/:id/respond
router.patch("/:id/respond", protect, restrictTo("driver"), async (req, res) => {
  try {
    const { action } = req.body;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Action must be accept or reject." });
    }

    const booking = await storage.getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });

    if (booking.driverId !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking already responded to." });
    }

    if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
      await storage.updateBooking(req.params.id, { status: "rejected" });
      if (booking.customerPhone) {
        await sendSMS(booking.customerPhone, `Sorry, the driver did not respond in time. Your booking has been automatically rejected.`);
      }
      return res.status(400).json({ success: false, message: "Booking has expired." });
    }

    const newStatus = action === "accept" ? "confirmed" : "rejected";
    const updated = await storage.updateBooking(req.params.id, { status: newStatus });
    const vehicle = await storage.getVehicleById(booking.vehicleId);

    if (booking.customerPhone) {
      const msg = action === "accept"
        ? `Your booking for ${vehicle?.carName} on ${booking.bookingDate} has been confirmed!`
        : `The driver rejected your booking for ${vehicle?.carName} on ${booking.bookingDate}.`;
      await sendSMS(booking.customerPhone, msg);
    }

    res.status(200).json({ success: true, booking: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/bookings/expire
router.post("/expire", protect, async (req, res) => {
  try {
    const all = await storage.getAllBookings();
    const expired = all.filter(b => b.status === "pending" && new Date() > new Date(b.expiresAt));
    for (const booking of expired) {
      await storage.updateBooking(booking._id, { status: "rejected" });
      const vehicle = await storage.getVehicleById(booking.vehicleId);
      if (booking.customerPhone) {
        await sendSMS(booking.customerPhone, `Sorry, the driver did not respond within 5 minutes. Your booking for ${vehicle?.carName} has been automatically rejected.`);
      }
    }
    res.status(200).json({ success: true, expired: expired.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", protect, restrictTo("customer", "driver"), async (req, res) => {
  try {
    const booking = await storage.getBookingById(req.params.id);
    if (!booking || booking.customerId !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    const updated = await storage.updateBooking(req.params.id, { status: "cancelled" });
    res.status(200).json({ success: true, message: "Booking cancelled successfully.", booking: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
