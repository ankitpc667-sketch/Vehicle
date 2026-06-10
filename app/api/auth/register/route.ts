import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/lib/storage";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ success: false, message: "Please provide name, email, and password." }, { status: 400 });

    const existing = await findUserByEmail(email);
    if (existing)
      return NextResponse.json({ success: false, message: "An account with this email already exists." }, { status: 400 });

    const user = await createUser({
      name,
      email: email.toLowerCase(),
      password,
      role: role === "driver" ? "driver" : "customer",
    });

    const token = signToken(String(user._id));
    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      token,
      user: { _id: String(user._id), name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
