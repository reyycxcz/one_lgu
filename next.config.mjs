import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
// Content-Security-Policy is NOT set here — it needs a fresh nonce per
// request (see src/proxy.ts), which a static config-level header can't
// provide. Every other security header below is static, so it stays here.
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    // Resident attachment uploads (IDs, complaint evidence) can be up to 5MB
    // each and are sent through server actions; the default limit is 1MB.
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

// withSentryConfig only uploads source maps when SENTRY_AUTH_TOKEN/ORG/PROJECT
// are set — without them it degrades gracefully to a no-op wrapper (a build-time
// log line, nothing else), same "unconfigured = inert" behavior as the rest
// of the Sentry setup (src/instrumentation.ts, src/instrumentation-client.ts).
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
});
