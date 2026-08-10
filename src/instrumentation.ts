// Server + edge runtime error monitoring. No-op until NEXT_PUBLIC_SENTRY_DSN
// is set — Sentry.init() with an empty/undefined dsn is a documented no-op,
// so nothing changes in behavior or bundle size until it's configured.
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export async function onRequestError(...args: unknown[]) {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error - Next.js's onRequestError hook signature matches
  // Sentry.captureRequestError's parameters at runtime; spreading unknown[]
  // just avoids importing Sentry's types at module scope for the no-op path.
  Sentry.captureRequestError(...args);
}
