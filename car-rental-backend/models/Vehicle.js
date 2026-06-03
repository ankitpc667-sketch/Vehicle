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
    phone: { type: String, required: false, match: /^\d{10}$/ },
    purpose: {
      type: String,
      enum: ["cab", "trip", "events"],
      required: false,
    },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    photo: { type: String, default: "" }, // base64 or URL
    withDriver: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
module.exports = Vehicle;
