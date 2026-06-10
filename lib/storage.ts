import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined");
  await mongoose.connect(uri);
  isConnected = true;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  role: { type: String, enum: ["customer", "driver", "admin"], default: "customer" },
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  driverId: String,
  driverName: String,
  carName: String,
  carNo: String,
  aadharNo: String,
  license: String,
  experience: String,
  phone: String,
  purpose: String,
  price: String,
  location: String,
  photo: String,
  withDriver: Boolean,
}, { timestamps: true });

const BookingSchema = new mongoose.Schema({
  customerId: String,
  vehicleId: { type: mongoose.Schema.Types.Mixed },
  driverId: String,
  purpose: String,
  bookingDate: String,
  withDriver: String,
  status: { type: String, default: "pending" },
  expiresAt: Date,
}, { timestamps: true });

// Prevent model re-registration in dev hot-reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
const Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

// ─── User Functions ───────────────────────────────────────────────────────────
export async function findUserByEmail(email: string) {
  await connectDB();
  return await User.findOne({ email: email.toLowerCase() }).lean();
}

export async function findUserById(id: string) {
  await connectDB();
  try {
    return await User.findById(id).lean();
  } catch {
    return null;
  }
}

export async function createUser(user: any) {
  await connectDB();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = await User.create({ ...user, password: hashedPassword });
  return newUser.toObject();
}

export async function comparePassword(stored: string, supplied: string) {
  return await bcrypt.compare(supplied, stored);
}

// ─── Vehicle Functions ────────────────────────────────────────────────────────
export async function getAllVehicles(filter: Record<string, any> = {}) {
  await connectDB();
  const query: Record<string, any> = {};
  if (filter.purpose) query.purpose = filter.purpose;
  if (filter.withDriver !== undefined) query.withDriver = filter.withDriver;
  if (filter.driverId) query.driverId = filter.driverId;
  return await Vehicle.find(query).lean();
}

export async function getVehicleById(id: string) {
  await connectDB();
  try {
    return await Vehicle.findById(id).lean();
  } catch {
    return null;
  }
}

export async function createVehicle(data: any) {
  await connectDB();
  const vehicle = await Vehicle.create(data);
  return vehicle.toObject();
}

export async function updateVehicle(id: string, data: any) {
  await connectDB();
  try {
    return await Vehicle.findByIdAndUpdate(id, data, { new: true }).lean();
  } catch {
    return null;
  }
}

export async function deleteVehicle(id: string) {
  await connectDB();
  try {
    return await Vehicle.findByIdAndDelete(id).lean();
  } catch {
    return null;
  }
}

// ─── Booking Functions ────────────────────────────────────────────────────────
export async function getAllBookings(filter: Record<string, any> = {}) {
  await connectDB();
  const query: Record<string, any> = {};
  if (filter.userId) query.customerId = filter.userId;
  if (filter.vehicleId) query.vehicleId = filter.vehicleId;
  if (filter.driverId) query.driverId = filter.driverId;
  return await Booking.find(query).populate("vehicleId").lean();
}

export async function getBookingById(id: string) {
  await connectDB();
  try {
    return await Booking.findById(id).populate("vehicleId").lean();
  } catch {
    return null;
  }
}

export async function createBooking(data: any) {
  await connectDB();
  const booking = await Booking.create(data);
  return await Booking.findById(booking._id).populate("vehicleId").lean();
}

export async function updateBooking(id: string, data: any) {
  await connectDB();
  try {
    return await Booking.findByIdAndUpdate(id, data, { new: true }).populate("vehicleId").lean();
  } catch {
    return null;
  }
}

export async function deleteBooking(id: string) {
  await connectDB();
  try {
    return await Booking.findByIdAndDelete(id).lean();
  } catch {
    return null;
  }
}
