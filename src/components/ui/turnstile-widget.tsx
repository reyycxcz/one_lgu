"use client";

import { useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    handleTurnstileError?: () => void;
  }
}

// Renders nothing until NEXT_PUBLIC_TURNSTILE_SITE_KEY is set — safe to drop
// into any form ahead of time. Cloudflare's script auto-renders any element
// with class="cf-turnstile" on the page, and injects a hidden input named
// "cf-turnstile-response" that server actions read from formData.
//
// Supabase Auth's captcha check is currently off for this project, so this
// widget isn't gating anything — it's pure defense-in-depth for later. If it
// can't connect (e.g. the current hostname isn't on this site key's allowed
// domains in the Cloudflare Turnstile dashboard), we hide it instead of
// leaving Cloudflare's own "Unable to connect to website" box on the form.
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const containerRef = useRef<HTMLDivElement>(null);

  if (!siteKey) return null;

  function hideWidget() {
    if (containerRef.current) containerRef.current.style.display = "none";
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onError={hideWidget}
        onReady={() => {
          window.handleTurnstileError = hideWidget;
        }}
      />
      <div
        ref={containerRef}
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-theme="light"
        data-error-callback="handleTurnstileError"
      />
    </>
  );
}
