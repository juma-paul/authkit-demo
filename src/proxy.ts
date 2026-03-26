import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/restore-account",
];

export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);
  const isLoggedIn = request.cookies.has("accessToken");

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/profile",
    "/change-email",
    "/change-password",
    "/2fa",
    "/delete-account",
  ],
};
