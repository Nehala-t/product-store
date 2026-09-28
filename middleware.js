import { NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/signUp",
  "/about",
  "/contact",
];

const adminRoutes = [
  "/admin",
];

const sellerRoutes = [
  "/sellerDashBoard",
];

const userRoutes = [
  "/cart",
  "/product",
];

const sharedRoutes = [
  "/productdetails",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;

  // Redirect logged-in users away from login/register
  if (
    token &&
    (pathname === "/login" || pathname === "/signUp")
  ) {
    if (role === "seller") {
      return NextResponse.redirect(
        new URL("/sellerDashBoard", request.url)
      );
    }

    if (role === "user") {
      return NextResponse.redirect(
        new URL("/product", request.url)
      );
    }

    if (role === "admin") {
      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  // Check public routes
  const isPublicRoute = publicRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Shared routes are accessible to all authenticated roles
  const isSharedRoute = sharedRoutes.some(
    (route) => pathname.startsWith(route)
  );

  if (!isSharedRoute && token) {

    // Admin route protection
    if (
      adminRoutes.some((route) =>
        pathname.startsWith(route)
      ) &&
      role !== "admin"
    ) {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }

    // Seller route protection
    if (
      sellerRoutes.some((route) =>
        pathname.startsWith(route)
      ) &&
      role !== "seller"
    ) {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }

    // User route protection
    if (
      userRoutes.some((route) =>
        pathname.startsWith(route)
      ) &&
      role !== "user"
    ) {
      return NextResponse.redirect(
        new URL("/unauthorized", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|favicon.ico|assets|api).*)",
  ],
};