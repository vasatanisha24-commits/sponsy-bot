import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { sendApprovedEmail } from '@/app/lib/integrations/gmail';

// POST /api/emails/[id]/send — send an approved email via Gmail
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = await prisma.email.findUnique({
      where: { id },
      include: { contact: true },
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (email.status !== 'approved') {
      return NextResponse.json(
        { error: `Cannot send email with status '${email.status}'. Must be 'approved'.` },
        { status: 400 }
      );
    }

    const result = await sendApprovedEmail({
      to: email.contact.email,
      subject: email.subject,
      body: email.body,
      status: 'approved',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Mark as sent in the database
    await prisma.email.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date() },
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
