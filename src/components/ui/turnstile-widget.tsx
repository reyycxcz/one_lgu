"use client";

import Script from "next/script";

// Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set — safe to drop
// into any form ahead of time. Cloudflare's script auto-renders any element
// with class="cf-turnstile" on the page, and injects a hidden input named
// "cf-turnstile-response" that server actions read from formData.
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
