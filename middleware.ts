import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_CUSTOMER_ROUTES = [
  "/customer-dashboard",
  "/book-car",
  "/my-bookings",
  "/available-vehicles",
];

const PROTECTED_DRIVER_ROUTES = [
  "/driver-dashboard",
  "/driver",
  "/my-vehicles",
  "/driver-bookings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  const isCustomerRoute = PROTECTED_CUSTOMER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isDriverRoute = PROTECTED_DRIVER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if ((isCustomerRoute || isDriverRoute) && !token) {
    return NextResponse.redirect(new URL("/role-selection", request.url));
  }

  if (isCustomerRoute && userRole === "driver") {
    return NextResponse.redirect(new URL("/driver-dashboard", request.url));
  }

  if (isDriverRoute && userRole === "customer") {
    return NextResponse.redirect(new URL("/customer-dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customer-dashboard/:path*",
    "/driver-dashboard/:path*",
    "/driver/:path*",
    "/my-vehicles/:path*",
    "/driver-bookings/:path*",
    "/book-car/:path*",
    "/my-bookings/:path*",
    "/available-vehicles/:path*",
  ],
};
