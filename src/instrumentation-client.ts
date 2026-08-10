// Browser-side error monitoring. Same no-op-until-configured behavior as
// src/instrumentation.ts — see there for why an unset DSN is safe to skip.
import * as Sentry from "@sentry/nextjs";

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}

// Lets Sentry trace client-side route transitions. Sentry.captureRouterTransitionStart
// is a no-op internally when init() above was skipped, so this stays inert too.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
