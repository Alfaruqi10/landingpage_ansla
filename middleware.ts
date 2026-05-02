import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_AUTH_COOKIE_NAME,
  verifyEdgeAuthToken
} from "./lib/session-edge";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyEdgeAuthToken(token) : null;

  if (pathname === "/admin/login") {
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
