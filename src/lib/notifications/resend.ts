import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://one-lgu.vercel.app";
// Small (10KB, 128px) email-optimized logo hosted on Supabase Storage. The
// in-app 1.4MB logo is too heavy for email clients (slow load / clipping).
const LOGO_URL =
  "https://usvcpgohfhaqngcgsleq.supabase.co/storage/v1/object/public/attachments/brand/one_lgu_email.png";

/**
 * Wraps body content in the OneLGU-branded email shell (logo header, green
 * accents, footer). `bodyHtml` is the inner content — headings, paragraphs,
 * and an optional call-to-action button built with `emailButton()`.
 */
export function brandedEmail({
  heading,
  bodyHtml,
  previewText = "",
}: {
  heading: string;
  bodyHtml: string;
  previewText?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0; padding:0; background-color:#F8FDF9; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#143D2A;">
  <span style="display:none; font-size:1px; color:#F8FDF9; max-height:0; max-width:0; opacity:0; overflow:hidden;">${previewText}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FDF9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background-color:#ffffff; border:1px solid #E3F2E7; border-radius:16px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px; border-bottom:1px solid #E3F2E7;">
              <img src="${LOGO_URL}" width="64" height="64" alt="OneLGU" style="display:block; border:0; width:64px; height:64px;" />
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <h1 style="margin:0 0 16px; font-size:20px; line-height:1.3; font-weight:700; color:#143D2A;">${heading}</h1>
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px; border-top:1px solid #E3F2E7; background-color:#FAFDFB;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:#8a9a90;">
                OneLGU — Digital Portal for the Municipality of Dingras, Ilocos Norte.<br />
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0; font-size:11px; color:#b0bdb5;">© ${new Date().getFullYear()} OneLGU Project · Ilocos Norte</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** A green pill call-to-action button for use inside brandedEmail bodyHtml. */
export function emailButton(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
    <tr>
      <td style="border-radius:999px; background-color:#00B15E;">
        <a href="${href}" style="display:inline-block; padding:12px 28px; font-size:14px; font-weight:700; color:#ffffff; text-decoration:none; border-radius:999px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

interface SendNotificationEmail {
  to: string;
  subject: string;
  html: string;
}

// Until a real domain is verified in Resend, send from Resend's shared
// testing sender. NOTE: in testing mode Resend only delivers to the address
// that owns the Resend account. Once a domain is verified, change this to
// e.g. "OneLGU <noreply@yourdomain>".
const FROM_ADDRESS = "OneLGU <onboarding@resend.dev>";

export async function sendNotificationEmail({ to, subject, html }: SendNotificationEmail) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { error: error.message };
    }

    return { data };
  } catch (err) {
    console.error("Email send failed:", err);
    return { error: "Failed to send email notification" };
  }
}
