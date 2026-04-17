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

  // Check cookies
  const hasAccessToken = request.cookies.has("accessToken");
  const hasRefreshToken = request.cookies.has("refreshToken");

  // Only redirect if BOTH tokens missing
  if (!hasAccessToken && !hasRefreshToken && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat", "/profile", "/profile/:path*"],
};
