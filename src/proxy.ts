import { NextRequest, NextResponse } from "next/server";

// Public routes
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/verify-email-change",
  "/forgot-password",
  "/reset-password",
  "/restore-account",
  "/2fa",
  "/auth/callback",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Check access token cookie
  const hasAccessToken = request.cookies.has("accessToken");

  // If not logged in → protect private routes
  if (!hasAccessToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat", "/profile", "/profile/:path*"],
};
