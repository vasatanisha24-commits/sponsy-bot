import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

/**
 * GET /api/emails
 *
 * Query params:
 *   status  – filter by email status, e.g. "pending_review" or "approved"
 *             omit to return all emails
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const emails = await prisma.email.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sponsor: {
          include: {
            research: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        contact: true,
      },
    });

    return NextResponse.json(emails);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to load emails', details: err.message },
      { status: 500 }
    );
  }
}