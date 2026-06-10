import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, updateBooking } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const all = await getAllBookings();
  const expired = all.filter((b: any) => b.status === "pending" && new Date() > new Date(b.expiresAt));
  for (const booking of expired) {
    await updateBooking(booking._id, { status: "rejected" });
  }
  return NextResponse.json({ success: true, expired: expired.length });
}
