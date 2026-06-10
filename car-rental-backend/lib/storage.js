const fs = require('fs').promises;
const path = require('path');

// Directory for JSON data files
const DATA_DIR = path.join(__dirname, '..', 'data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (e) {}
}

async function readJson(file) {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // Return empty object if file missing or invalid
    return {};
  }
}

async function writeJson(file, data) {
  await ensureDataDir();
  const tmp = file + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, file);
}

// ---------- Users ----------
const USERS_FILE = path.join(DATA_DIR, 'users.json');

async function findUserByEmail(email) {
  const users = await readJson(USERS_FILE);
  return Object.values(users).find(u => u.email.toLowerCase() === email.toLowerCase());
}

async function findUserById(id) {
  const users = await readJson(USERS_FILE);
  return users[id] || null;
}

async function createUser(user) {
  const users = await readJson(USERS_FILE);
  const id = Date.now().toString();
  const newUser = { _id: id, ...user };
  users[id] = newUser;
  await writeJson(USERS_FILE, users);
  return newUser;
}

function comparePassword(stored, supplied) {
  // Simple plain-text compare for demo purposes
  return stored === supplied;
}

// ---------- Vehicles ----------
const VEHICLES_FILE = path.join(DATA_DIR, 'vehicles.json');

async function getAllVehicles(filter = {}) {
  const vehicles = Object.values(await readJson(VEHICLES_FILE));
  return vehicles.filter(v => {
    let ok = true;
    if (filter.purpose) ok = ok && v.purpose === filter.purpose;
    if (filter.withDriver !== undefined) ok = ok && v.withDriver === filter.withDriver;
    if (filter.driverId) ok = ok && v.driverId === filter.driverId;
    return ok;
  });
}

async function getVehicleById(id) {
  const vehicles = await readJson(VEHICLES_FILE);
  return vehicles[id] || null;
}

async function createVehicle(data) {
  const vehicles = await readJson(VEHICLES_FILE);
  const id = Date.now().toString();
  const newVehicle = { _id: id, createdAt: new Date().toISOString(), ...data };
  vehicles[id] = newVehicle;
  await writeJson(VEHICLES_FILE, vehicles);
  return newVehicle;
}

async function updateVehicle(id, data) {
  const vehicles = await readJson(VEHICLES_FILE);
  if (!vehicles[id]) return null;
  const updated = { ...vehicles[id], ...data, updatedAt: new Date().toISOString() };
  vehicles[id] = updated;
  await writeJson(VEHICLES_FILE, vehicles);
  return updated;
}

async function deleteVehicle(id) {
  const vehicles = await readJson(VEHICLES_FILE);
  const removed = vehicles[id] || null;
  if (removed) {
    delete vehicles[id];
    await writeJson(VEHICLES_FILE, vehicles);
  }
  return removed;
}

// ---------- Bookings ----------
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

async function getAllBookings(filter = {}) {
  const bookings = Object.values(await readJson(BOOKINGS_FILE));
  return bookings.filter(b => {
    let ok = true;
    if (filter.userId) ok = ok && b.userId === filter.userId;
    if (filter.vehicleId) ok = ok && b.vehicleId === filter.vehicleId;
    return ok;
  });
}

async function getBookingById(id) {
  const bookings = await readJson(BOOKINGS_FILE);
  return bookings[id] || null;
}

async function createBooking(data) {
  const bookings = await readJson(BOOKINGS_FILE);
  const id = Date.now().toString();
  const newBooking = { _id: id, createdAt: new Date().toISOString(), ...data };
  bookings[id] = newBooking;
  await writeJson(BOOKINGS_FILE, bookings);
  return newBooking;
}

async function updateBooking(id, data) {
  const bookings = await readJson(BOOKINGS_FILE);
  if (!bookings[id]) return null;
  const updated = { ...bookings[id], ...data, updatedAt: new Date().toISOString() };
  bookings[id] = updated;
  await writeJson(BOOKINGS_FILE, bookings);
  return updated;
}

async function deleteBooking(id) {
  const bookings = await readJson(BOOKINGS_FILE);
  const removed = bookings[id] || null;
  if (removed) {
    delete bookings[id];
    await writeJson(BOOKINGS_FILE, bookings);
  }
  return removed;
}

module.exports = {
  // Users
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
  // Vehicles
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  // Bookings
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};
