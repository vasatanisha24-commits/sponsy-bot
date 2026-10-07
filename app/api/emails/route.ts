import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// PATCH /api/emails/:id/approve — human approves the email
export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const email = await prisma.email.update({
    where: { id: params.id },
    data: { status: 'approved', reviewerId: 'user-tanisha' },
  });
  return NextResponse.json(email);
}