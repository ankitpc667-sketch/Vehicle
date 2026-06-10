import { NextRequest } from "next/server";
import { findUserById } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "ankitsecret123";

// Simple JWT implementation without external library
function base64url(str: string): string {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(base64, "base64").toString("utf8");
}

import crypto from "crypto";

function hmacSHA256(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function signToken(id: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ id, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }));
  const signature = hmacSHA256(JWT_SECRET, `${header}.${payload}`);
  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { id: string } | null {
  try {
    const [header, payload, signature] = token.split(".");
    const expected = hmacSHA256(JWT_SECRET, `${header}.${payload}`);
    if (expected !== signature) return null;
    const data = JSON.parse(base64urlDecode(payload));
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return { id: data.id };
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<any | null> {
  let token: string | null = null;

  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) token = auth.slice(7);

  if (!token) {
    const cookie = req.cookies.get("token")?.value;
    if (cookie) token = cookie;
  }

  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return await findUserById(decoded.id);
}
