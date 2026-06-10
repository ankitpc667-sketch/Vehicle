import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAllVehicles, updateVehicle, deleteVehicle } from "@/lib/storage";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  const all = await getAllVehicles();
  const vehicle = all.find((v: any) => v._id === id && v.driverId === String(user._id));
  if (!vehicle) return NextResponse.json({ success: false, message: "Vehicle not found or you do not own this vehicle." }, { status: 404 });

  const body = await req.json();
  const allowedFields = ["driverName","carName","carNo","aadharNo","license","experience","phone","purpose","price","location","photo","withDriver"];
  const updates: Record<string, any> = {};
  allowedFields.forEach((f) => { if (body[f] !== undefined) updates[f] = body[f]; });

  const updated = await updateVehicle(id, updates);
  return NextResponse.json({ success: true, vehicle: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  const all = await getAllVehicles();
  const vehicle = all.find((v: any) => v._id === id && v.driverId === String(user._id));
  if (!vehicle) return NextResponse.json({ success: false, message: "Vehicle not found or you do not own this vehicle." }, { status: 404 });

  await deleteVehicle(id);
  return NextResponse.json({ success: true, message: "Vehicle deleted successfully." });
}
