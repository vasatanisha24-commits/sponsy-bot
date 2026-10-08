import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// PATCH /api/emails/[id]/reject — human rejects the email
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid email ID.' }, { status: 400 });
  }

  try {
    const email = await prisma.email.findUnique({ where: { id } });

    if (!email) {
      return NextResponse.json({ error: 'Email not found.' }, { status: 404 });
    }

    if (email.status === 'sent') {
      return NextResponse.json(
        { error: 'Cannot reject an email that has already been sent.' },
        { status: 400 }
      );
    }

    if (email.status === 'rejected') {
      return NextResponse.json({ message: 'Email is already rejected.', email }, { status: 200 });
    }

    const updatedEmail = await prisma.email.update({
      where: { id },
      data: {
        status: 'rejected',
        reviewerId: 'system', // Replace with real user ID when auth is added
      },
    });

    return NextResponse.json(updatedEmail);
  } catch (err: any) {
    console.error('[PATCH /api/emails/[id]/reject]', err);
    return NextResponse.json({ error: 'Failed to reject email.' }, { status: 500 });
  }
}
