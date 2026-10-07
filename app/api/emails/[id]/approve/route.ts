import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// PATCH /api/emails/[id]/approve — human approves the email
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const email = await prisma.email.update({
      where: { id },
      data: {
        status: 'approved',
        reviewerId: 'system', // Replace with real user ID when auth is added
      },
    });
    return NextResponse.json(email);
  } catch {
    return NextResponse.json({ error: 'Failed to approve email' }, { status: 500 });
  }
}
