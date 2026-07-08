import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendNotificationEmail {
  to: string;
  subject: string;
  html: string;
}

export async function sendNotificationEmail({ to, subject, html }: SendNotificationEmail) {
  try {
    const { data, error } = await resend.emails.send({
      from: "OneLGU <noreply@onelgu.gov.ph>",
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
