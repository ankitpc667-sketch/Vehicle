import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAllBookings, getVehicleById, findUserById } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  const allBookings = await getAllBookings();
  const bookings = allBookings
    .filter((b: any) => b.driverId === String(user._id) && ["pending", "confirmed", "rejected", "cancelled"].includes(b.status))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const enriched = await Promise.all(bookings.map(async (b: any) => {
    const vehicle = await getVehicleById(b.vehicleId);
    const customer = await findUserById(b.customerId);
    return { ...b, vehicleId: vehicle || b.vehicleId, customer };
  }));

  return NextResponse.json({ success: true, bookings: enriched });
}
