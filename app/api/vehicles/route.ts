import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { getAllVehicles, createVehicle } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter: Record<string, any> = {};
  if (searchParams.get("purpose")) filter.purpose = searchParams.get("purpose");
  if (searchParams.get("withDriver")) filter.withDriver = searchParams.get("withDriver") === "true";

  let vehicles = await getAllVehicles(filter);
  vehicles = vehicles.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pickupLocation = searchParams.get("pickupLocation");
  if (pickupLocation) {
    const queryLoc = pickupLocation.toLowerCase().trim();
    vehicles = vehicles.filter((v: any) => {
      if (!v.location) return false;
      const vehicleLoc = v.location.toLowerCase().trim();
      const isSubstring = vehicleLoc.includes(queryLoc) || queryLoc.includes(vehicleLoc);
      const queryWords = queryLoc.split(/[\s,.\-]+/).filter((w: string) => w.length > 2);
      const vehicleWords = vehicleLoc.split(/[\s,.\-]+/).filter((w: string) => w.length > 2);
      const hasOverlap = queryWords.some((qw: string) => vehicleWords.some((vw: string) => vw.includes(qw) || qw.includes(vw)));
      return isSubstring || hasOverlap;
    });
  }

  return NextResponse.json({ success: true, vehicles });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
  if (user.role !== "driver") return NextResponse.json({ success: false, message: "Access denied." }, { status: 403 });

  try {
    const body = await req.json();
    const vehicle = await createVehicle({
      driverId: String(user._id),
      driverName: body.driverName,
      carName: body.carName,
      carNo: body.carNo,
      aadharNo: body.aadharNo,
      license: body.license,
      experience: body.experience ? Number(body.experience) : undefined,
      phone: body.phone,
      purpose: body.purpose,
      price: body.price ? Number(body.price) : 0,
      location: body.location,
      photo: body.photo || "",
      withDriver: body.withDriver === true || body.withDriver === "true",
    });
    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
