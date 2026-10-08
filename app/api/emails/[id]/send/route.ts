import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { sendViaGmail } from '@/app/lib/integrations/gmail';

/**
 * POST /api/emails/[id]/send
 *
 * Sends an approved outreach email via Gmail and records the result.
 *
 * Safety rules (enforced in this exact order):
 *  1. Email record must exist in the database.
 *  2. Email.status must be exactly 'approved'. Any other status → 400.
 *  3. Contact email must be present on the related Contact record.
 *  4. sendViaGmail() enforces its own status/credential/content checks.
 *  5. DB is only updated to 'sent' AFTER Gmail confirms delivery.
 *  6. On any failure the DB is NOT modified — email stays 'approved'.
 *  7. The actual messageId returned by Gmail is recorded in the response.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // ── 1. Load email with contact ───────────────────────────────────────────
  let email: Awaited<ReturnType<typeof prisma.email.findUnique>> & { contact?: any } | null;

  try {
    email = await prisma.email.findUnique({
      where: { id },
      include: { contact: true },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Database error while loading email.', details: err.message },
      { status: 500 }
    );
  }

  // ── 2. Existence check ───────────────────────────────────────────────────
  if (!email) {
    return NextResponse.json(
      { error: `Email '${id}' not found.` },
      { status: 404 }
    );
  }

  // ── 3. Status gate — must be 'approved' ──────────────────────────────────
  if (email.status !== 'approved') {
    return NextResponse.json(
      {
        error: `Cannot send: email status is '${email.status}'. Only 'approved' emails can be sent.`,
        currentStatus: email.status,
      },
      { status: 400 }
    );
  }

  // ── 4. Recipient sanity check ─────────────────────────────────────────────
  const recipientEmail = (email as any).contact?.email?.trim();
  if (!recipientEmail) {
    return NextResponse.json(
      { error: 'Cannot send: no valid recipient email on the associated Contact record.' },
      { status: 422 }
    );
  }

  // ── 5. Attempt to send via Gmail ──────────────────────────────────────────
  const result = await sendViaGmail({
    to: recipientEmail,
    subject: email.subject,
    body: email.body,
    dbStatus: email.status,   // passes 'approved' — sendViaGmail re-validates
  });

  // ── 6. Handle Gmail failure — do NOT touch the DB ─────────────────────────
  if (!result.success) {
    console.error('[send-email] Gmail error for email', id, ':', result.error);
    return NextResponse.json(
      {
        error: result.error,
        ...(result.configError ? { configError: true } : {}),
      },
      { status: result.configError ? 503 : 502 }
    );
  }

  // ── 7. Mark as sent ONLY after confirmed Gmail delivery ───────────────────
  try {
    const sent = await prisma.$transaction(async (tx) => {
      const updatedEmail = await tx.email.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          messageId: result.messageId,
        },
      });

      if (email?.sponsorId) {
        await tx.sponsor.update({
          where: { id: email.sponsorId },
          data: { status: 'contacted' },
        });
      }

      return updatedEmail;
    });

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      sentAt: sent.sentAt,
    });
  } catch (err: any) {
    // Exceptional case: Gmail sent it but DB update failed.
    // Return 500 with the messageId so the operator can manually reconcile.
    console.error('[send-email] DB update failed after successful Gmail send. messageId:', result.messageId, err);
    return NextResponse.json(
      {
        error: 'Email was sent via Gmail but the database update failed. Please manually mark as sent.',
        messageId: result.messageId,
        details: err.message,
      },
      { status: 500 }
    );
  }
}
