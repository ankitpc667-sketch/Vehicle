import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJson(file: string): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = file + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
const VEHICLES_FILE = path.join(DATA_DIR, "vehicles.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");

export async function findUserByEmail(email: string) {
  const users = await readJson(USERS_FILE);
  return Object.values(users).find((u: any) => u.email.toLowerCase() === email.toLowerCase()) as any || null;
}

export async function findUserById(id: string) {
  const users = await readJson(USERS_FILE);
  return (users[id] as any) || null;
}

export async function createUser(user: any) {
  const users = await readJson(USERS_FILE);
  const id = Date.now().toString();
  const newUser = { _id: id, ...user };
  users[id] = newUser;
  await writeJson(USERS_FILE, users);
  return newUser;
}

export function comparePassword(stored: string, supplied: string) {
  return stored === supplied;
}

export async function getAllVehicles(filter: Record<string, any> = {}) {
  const vehicles = Object.values(await readJson(VEHICLES_FILE)) as any[];
  return vehicles.filter((v) => {
    let ok = true;
    if (filter.purpose) ok = ok && v.purpose === filter.purpose;
    if (filter.withDriver !== undefined) ok = ok && v.withDriver === filter.withDriver;
    if (filter.driverId) ok = ok && v.driverId === filter.driverId;
    return ok;
  });
}

export async function getVehicleById(id: string) {
  const vehicles = await readJson(VEHICLES_FILE);
  return (vehicles[id] as any) || null;
}

export async function createVehicle(data: any) {
  const vehicles = await readJson(VEHICLES_FILE);
  const id = Date.now().toString();
  const newVehicle = { _id: id, createdAt: new Date().toISOString(), ...data };
  vehicles[id] = newVehicle;
  await writeJson(VEHICLES_FILE, vehicles);
  return newVehicle;
}

export async function updateVehicle(id: string, data: any) {
  const vehicles = await readJson(VEHICLES_FILE);
  if (!vehicles[id]) return null;
  const updated = { ...vehicles[id], ...data, updatedAt: new Date().toISOString() };
  vehicles[id] = updated;
  await writeJson(VEHICLES_FILE, vehicles);
  return updated;
}

export async function deleteVehicle(id: string) {
  const vehicles = await readJson(VEHICLES_FILE);
  const removed = vehicles[id] || null;
  if (removed) {
    delete vehicles[id];
    await writeJson(VEHICLES_FILE, vehicles);
  }
  return removed;
}

export async function getAllBookings(filter: Record<string, any> = {}) {
  const bookings = Object.values(await readJson(BOOKINGS_FILE)) as any[];
  return bookings.filter((b) => {
    let ok = true;
    if (filter.userId) ok = ok && b.customerId === filter.userId;
    if (filter.vehicleId) ok = ok && b.vehicleId === filter.vehicleId;
    return ok;
  });
}

export async function getBookingById(id: string) {
  const bookings = await readJson(BOOKINGS_FILE);
  return (bookings[id] as any) || null;
}

export async function createBooking(data: any) {
  const bookings = await readJson(BOOKINGS_FILE);
  const id = Date.now().toString();
  const newBooking = { _id: id, createdAt: new Date().toISOString(), ...data };
  bookings[id] = newBooking;
  await writeJson(BOOKINGS_FILE, bookings);
  return newBooking;
}

export async function updateBooking(id: string, data: any) {
  const bookings = await readJson(BOOKINGS_FILE);
  if (!bookings[id]) return null;
  const updated = { ...bookings[id], ...data, updatedAt: new Date().toISOString() };
  bookings[id] = updated;
  await writeJson(BOOKINGS_FILE, bookings);
  return updated;
}

export async function deleteBooking(id: string) {
  const bookings = await readJson(BOOKINGS_FILE);
  const removed = bookings[id] || null;
  if (removed) {
    delete bookings[id];
    await writeJson(BOOKINGS_FILE, bookings);
  }
  return removed;
}
