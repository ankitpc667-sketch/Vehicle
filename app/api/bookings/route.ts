import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAllBookings, createBooking, getVehicleById } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const allBookings = await getAllBookings();
  const bookings = allBookings
    .filter((b: any) => b.customerId === String(user._id))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enriched = await Promise.all(bookings.map(async (b: any) => {
    const vehicle = await getVehicleById(b.vehicleId);
    return { ...b, vehicleId: vehicle || b.vehicleId };
  }));

  return NextResponse.json({ success: true, bookings: enriched });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  try {
    const body = await req.json();
    const { vehicleId, purpose, pickupLocation, dropLocation, pickupCoords, dropCoords, bookingDate, pickupTime, withDriver, customerName, customerPhone, customerLicense, customerAadhar } = body;

    if (!vehicleId || !purpose || !bookingDate)
      return NextResponse.json({ success: false, message: "Missing required booking fields." }, { status: 400 });

    const vehicle = await getVehicleById(String(vehicleId));
    if (!vehicle) return NextResponse.json({ success: false, message: "Vehicle not found." }, { status: 404 });

    const isSelfDrive = (purpose === "trip" || purpose === "events") && withDriver === "without-driver";
    if (!isSelfDrive && (!pickupLocation || !dropLocation))
      return NextResponse.json({ success: false, message: "Pickup and drop locations are required." }, { status: 400 });

    const booking = await createBooking({
      customerId: String(user._id),
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
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return NextResponse.json({ success: true, message: "Booking request sent! Waiting for driver confirmation.", booking }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
