import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { name, email, userId } = body;

    if (!userId || !name || !email) {
      return NextResponse.json(
        { error: 'userId, name, and email are required.' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim(), email: email.trim() },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    console.error('Failed to update user:', err);
    return NextResponse.json(
      { error: 'Failed to update account settings.' },
      { status: 500 }
    );
  }
}
