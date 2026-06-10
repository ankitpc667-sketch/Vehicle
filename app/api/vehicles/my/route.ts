import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAllVehicles } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  // Use user._id as string to fetch vehicles belonging to the driver
  const driverId = String(user._id);
  const all = await getAllVehicles({ driverId });
  const vehicles = all.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ success: true, vehicles });
}
