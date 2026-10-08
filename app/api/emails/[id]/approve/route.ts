import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// PATCH /api/emails/[id]/approve — human approves the email (pending_review → approved only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid email ID.' }, { status: 400 });
  }

  try {
    let body: { subject?: string; body?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional; proceed without it
    }

    const { subject, body: emailBody } = body;

    const email = await prisma.email.findUnique({ where: { id } });

    if (!email) {
      return NextResponse.json({ error: 'Email not found.' }, { status: 404 });
    }

    // ── Safety gate: only pending_review emails may be approved ───────────
    // 'draft' emails must go through pending_review first (human must see them).
    // 'sent' emails cannot be approved after sending.
    // 'approved' emails may have subject/body updated but status stays approved.
    if (email.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot approve an email that has already been sent.' },
        { status: 400 }
      );
    }

    if (email.status === 'rejected') {
      return NextResponse.json(
        { error: 'Cannot approve a rejected email.' },
        { status: 400 }
      );
    }

    // Only pending_review and approved may transition to/stay at approved
    if (email.status !== 'pending_review' && email.status !== 'approved') {
      return NextResponse.json(
        {
          error: `Cannot approve email in status '${email.status}'. Only pending_review emails can be approved.`,
        },
        { status: 400 }
      );
    }

    if (email.status === 'approved' && !subject && !emailBody) {
      return NextResponse.json({ message: 'Email is already approved.', email }, { status: 200 });
    }

    const updatedEmail = await prisma.email.update({
      where: { id },
      data: {
        status: 'approved',
        reviewerId: 'system', // Replace with real user ID when auth is added
        ...(subject ? { subject } : {}),
        ...(emailBody ? { body: emailBody } : {}),
      },
    });

    return NextResponse.json(updatedEmail);
  } catch (err: any) {
    console.error('[PATCH /api/emails/[id]/approve]', err);
    return NextResponse.json({ error: 'Failed to approve email.' }, { status: 500 });
  }
}
