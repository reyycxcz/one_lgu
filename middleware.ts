import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { canAccessPath, UserRole } from "@/lib/auth/rbac";

export async function middleware(request: NextRequest) {
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
      return NextResponse.redirect(loginUrl);
    }

    // Retrieve role from Supabase metadata
    const userRole = (user.app_metadata?.role || user.user_metadata?.role || "resident") as UserRole;

    // Verify access
    if (!canAccessPath(userRole, path)) {
      return NextResponse.redirect(new URL("/not-found", request.url));
    }
  }

  if (isAuthPage && user) {
    // Redirect authenticated users trying to access login/register
    const userRole = (user.app_metadata?.role || user.user_metadata?.role || "resident") as UserRole;
    
    if (userRole === "super_admin") {
      return NextResponse.redirect(new URL("/lgu/dashboard", request.url));
    } else if (userRole === "barangay_official" || userRole === "sk_official") {
      return NextResponse.redirect(new URL("/barangay/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/resident/dashboard", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
