/**
 * Transactional confirmation email via Resend.
 *
 * Graceful: if RESEND_API_KEY is unset, the function resolves without sending
 * (logged once). The lead is still stored either way, so the funnel never breaks
 * on an email-config failure.
 *
 * Prompt/source rationale is documented in README → "Abuse protection & email".
 */
import { Resend } from "resend";

let warned = false;

export async function sendConfirmationEmail(
  email: string,
  shareId: string | undefined,
  totalMonthlySavings: number
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    if (!warned) {
      console.warn("[email] RESEND_API_KEY not set — skipping confirmation email (lead still stored).");
      warned = true;
    }
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.MAIL_FROM || "AI Spend Audit <audit@resend.dev>";

  const shareLine = shareId
    ? `<p style="margin:0 0 12px;color:#475569">Your full audit is saved here:<br/><a href="${process.env.APP_URL || ""}/#/share/${shareId}">View your AI spend audit →</a></p>`
    : "";

  const savingsLine =
    totalMonthlySavings > 0
      ? `<p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#0f766e">We found $${totalMonthlySavings}/mo in potential savings.</p>`
      : `<p style="margin:0 0 12px;color:#475569">Your AI stack looks well-fit — no urgent changes flagged.</p>`;

  const consultationLine =
    totalMonthlySavings > 500
      ? `<p style="margin:12px 0 0;color:#475569">Because your potential savings are high, a Techvruk specialist can map a custom capture plan — reply to this email and we'll set up a 20-minute call.</p>`
      : `<p style="margin:12px 0 0;color:#475569">Want a heads-up when new optimizations apply to your stack? Just reply "notify me".</p>`;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 8px">Your AI spend audit is ready</h2>
      ${savingsLine}
      ${shareLine}
      ${consultationLine}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0" />
      <p style="font-size:12px;color:#94a3b8;margin:0">Sent by the AI Spend Audit tool. You received this because you requested your audit report.</p>
    </div>`;

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject:
      totalMonthlySavings > 0
        ? `Your AI spend audit: $${totalMonthlySavings}/mo in potential savings`
        : "Your AI spend audit is ready",
    html,
  });

  if (error) throw error;
}
