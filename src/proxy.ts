import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "lab_inventory_session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/items",
  "/loans",
  "/returns",
  "/users",
  "/activity",
  "/profile",
];

async function readSession(request: NextRequest): Promise<{ role?: string } | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    return payload as { role?: string };
  } catch {
    return null;
  }
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAdminOnlyPath(pathname: string): boolean {
  if (pathname === "/users" || pathname.startsWith("/users/")) return true;
  if (pathname === "/activity" || pathname.startsWith("/activity/")) return true;
  if (pathname === "/items/new") return true;
  if (/^\/items\/[^/]+\/edit$/.test(pathname)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const session = await readSession(request);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "redirectTo",
      `${pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminOnlyPath(pathname) && session.role !== "ADMIN") {
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set(
      "error",
      "Akses ditolak. Halaman tersebut hanya dapat diakses oleh Admin.",
    );
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/items/:path*",
    "/loans/:path*",
    "/returns/:path*",
    "/users/:path*",
    "/activity/:path*",
    "/profile/:path*",
  ],
};
