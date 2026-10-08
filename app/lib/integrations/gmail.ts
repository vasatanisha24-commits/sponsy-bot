import nodemailer from 'nodemailer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GmailSendParams {
  /** Recipient email address from the Contact record — must be real */
  to: string;
  /** Subject saved in the Email record (may have been human-edited) */
  subject: string;
  /** Body saved in the Email record (may have been human-edited) */
  body: string;
  /**
   * DB status of the Email record at the time the send is requested.
   * sendViaGmail() enforces this is 'approved' and will throw otherwise.
   */
  dbStatus: string;
}

export interface GmailSendResult {
  success: true;
  messageId: string;
}

export interface GmailSendError {
  success: false;
  error: string;
  /** Set when the failure is a configuration problem, not a transient error */
  configError?: true;
}

// ---------------------------------------------------------------------------
// Internal: build a transporter once per invocation
// ---------------------------------------------------------------------------

function buildTransporter() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user) throw new GmailConfigError('GMAIL_USER is not set in environment variables.');
  if (!pass) throw new GmailConfigError('GMAIL_APP_PASSWORD is not set in environment variables.');

  return {
    user,
    transporter: nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    }),
  };
}

class GmailConfigError extends Error {
  readonly isConfigError = true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send an outreach email via Gmail using GMAIL_USER / GMAIL_APP_PASSWORD.
 *
 * Safety rules enforced here (belt-and-suspenders in addition to the API route):
 *   1. dbStatus MUST be 'approved' — rejects all other statuses with a clear error.
 *   2. Credentials MUST be present — throws a config error if missing.
 *   3. Returns a discriminated union — callers MUST check result.success.
 *   4. Never silently swallows errors — all failures are returned with the real message.
 *   5. Does NOT update the database — the caller (API route) owns that side-effect.
 */
export async function sendViaGmail(
  params: GmailSendParams
): Promise<GmailSendResult | GmailSendError> {

  // ── Rule 1: status gate ─────────────────────────────────────────────────
  if (params.dbStatus !== 'approved') {
    return {
      success: false,
      error: `Send rejected: email status is '${params.dbStatus}'. Only 'approved' emails may be sent.`,
    };
  }

  // ── Rule 2: recipient sanity check ──────────────────────────────────────
  const to = params.to?.trim();
  if (!to || !to.includes('@')) {
    return {
      success: false,
      error: `Send rejected: invalid recipient address '${to}'.`,
    };
  }

  // ── Rule 3: subject / body must not be empty ────────────────────────────
  if (!params.subject?.trim()) {
    return { success: false, error: 'Send rejected: subject is empty.' };
  }
  if (!params.body?.trim()) {
    return { success: false, error: 'Send rejected: body is empty.' };
  }

  // ── Rule 4: credentials & transport ─────────────────────────────────────
  let user: string;
  let transporter: ReturnType<typeof nodemailer.createTransport>;

  try {
    ({ user, transporter } = buildTransporter());
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      configError: true,
    };
  }

  // ── Rule 5: send ─────────────────────────────────────────────────────────
  try {
    const info = await transporter.sendMail({
      from: `"Sponsy Bot" <${user}>`,
      to,
      subject: params.subject.trim(),
      text: params.body.trim(),
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: any) {
    // Return the real nodemailer / SMTP error — do NOT swallow it
    return {
      success: false,
      error: err.message ?? 'Unknown Gmail SMTP error',
    };
  }
}

/**
 * Verify Gmail credentials without sending anything.
 * Useful for startup health-checks or admin diagnostics.
 */
export async function verifyGmailConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { transporter } = buildTransporter();
    await transporter.verify();
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}
