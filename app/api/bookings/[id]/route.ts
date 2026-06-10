import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getBookingById, updateBooking } from "@/lib/storage";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const booking = await getBookingById(id);
  if (!booking || booking.customerId !== String(user._id))
    return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });

  const updated = await updateBooking(id, { status: "cancelled" });
  return NextResponse.json({ success: true, message: "Booking cancelled successfully.", booking: updated });
}
