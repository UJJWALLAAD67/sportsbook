import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@/generated/prisma";
// ✅ import enum correctly

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const pathname = req.nextUrl.pathname;

  // Example: restrict /admin routes
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== Role.ADMIN) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Restrict /owner routes to facility owners
  if (pathname.startsWith("/owner")) {
    if (!token || token.role !== Role.OWNER) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // Protect dashboard and booking routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/bookings")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
}
