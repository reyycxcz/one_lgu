import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { canAccessPath, UserRole } from "@/lib/auth/rbac";

// Basic per-IP rate limiting for auth entry points (login/register/forgot
// password), which are Next.js Server Actions POSTed to these page routes.
// This is an in-memory, single-instance limiter — good enough for a single
// deployment region, but resets on redeploy/restart and isn't shared across
// serverless instances. For a multi-region production deployment, replace
// this with a durable store (e.g. Upstash Redis + @upstash/ratelimit).
const RATE_LIMITS: Record<string, { windowMs: number; max: number }> = {
  "/login": { windowMs: 60_000, max: 8 },
  "/register": { windowMs: 60_000, max: 5 },
  "/forgot-password": { windowMs: 60_000, max: 3 },
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, windowMs: number, max: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const rateLimit = RATE_LIMITS[path];
  if (request.method === "POST" && rateLimit) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const allowed = checkRateLimit(`${path}:${ip}`, rateLimit.windowMs, rateLimit.max);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a moment and try again." },
        { status: 429 }
      );
    }
  }

  const { supabaseResponse, user } = await updateSession(request);

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
