const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
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
    // Customer details (Aadhaar & License required for self-drive; Aadhaar collected for all bookings)
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "", match: /^\d{10}$/ },
    customerLicense: { type: String, default: "" },
    customerAadhar: { type: String, default: "" },
    driverPhone: { type: String, default: "", match: /^\d{10}$/ },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
module.exports = Booking;
