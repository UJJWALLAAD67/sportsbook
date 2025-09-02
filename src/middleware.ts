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
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}
