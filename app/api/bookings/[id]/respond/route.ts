import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getBookingById, updateBooking } from "@/lib/storage";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  const { action } = await req.json();
  if (!["accept", "reject"].includes(action))
    return NextResponse.json({ success: false, message: "Action must be accept or reject." }, { status: 400 });

  const booking = await getBookingById(id);
  if (!booking) return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
  if (booking.driverId !== String(user._id)) return NextResponse.json({ success: false, message: "Not authorized." }, { status: 403 });
  if (booking.status !== "pending") return NextResponse.json({ success: false, message: "Booking already responded to." }, { status: 400 });

  if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
    await updateBooking(id, { status: "rejected" });
    return NextResponse.json({ success: false, message: "Booking has expired." }, { status: 400 });
  }

  const newStatus = action === "accept" ? "confirmed" : "rejected";
  const updated = await updateBooking(id, { status: newStatus });
  return NextResponse.json({ success: true, booking: updated });
}
