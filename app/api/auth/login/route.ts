import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, comparePassword } from "@/lib/storage";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ success: false, message: "Please provide email and password." }, { status: 400 });

    const user = await findUserByEmail(email);
    if (!user) return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });
    const isMatch = await comparePassword(user.password, password);
    if (!isMatch) return NextResponse.json({ success: false, message: "Invalid email or password." }, { status: 401 });

    const token = signToken(String(user._id));
    return NextResponse.json({
      success: true,
      message: "Login successful!",
      token,
      user: { _id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
