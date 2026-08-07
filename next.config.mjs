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

export default nextConfig;
