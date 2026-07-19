import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { canAccessPath, UserRole } from "@/lib/auth/rbac";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Paths that require auth
  const isProtectedPath =
    path.startsWith("/resident") ||
    path.startsWith("/barangay") ||
    path.startsWith("/lgu");

  // Auth pages (login, register, etc.)
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password");

  if (isProtectedPath) {
    if (!user) {
      // Direct redirect to login if not authenticated
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", path);
      const response = NextResponse.redirect(loginUrl);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value);
      });
      return response;
    }

    // Retrieve role from Supabase metadata
    const userRole = (user.app_metadata?.role || user.user_metadata?.role || "resident") as UserRole;

    // Verify access
    if (!canAccessPath(userRole, path)) {
      const response = NextResponse.redirect(new URL("/not-found", request.url));
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
        response.cookies.set(name, value);
      });
      return response;
    }
  }

  if (isAuthPage && user) {
    // Redirect authenticated users trying to access login/register
    const userRole = (user.app_metadata?.role || user.user_metadata?.role || "resident") as UserRole;

    let redirectUrl = new URL("/resident/dashboard", request.url);
    if (userRole === "super_admin" || userRole === "lgu_reviewer") {
      redirectUrl = new URL("/lgu/dashboard", request.url);
    } else if (userRole === "barangay_official") {
      redirectUrl = new URL("/barangay/dashboard", request.url);
    }

    const response = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      response.cookies.set(name, value);
    });
    return response;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
