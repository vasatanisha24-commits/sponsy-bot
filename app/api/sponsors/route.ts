import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// GET /api/sponsors — fetch all sponsors
export async function GET() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: { createdAt: 'desc' },
    include: { contacts: true },
  });
  return NextResponse.json(sponsors);
}

// POST /api/sponsors — create a new sponsor
export async function POST(req: Request) {
  const body = await req.json();
  const sponsor = await prisma.sponsor.create({ data: body });
  return NextResponse.json(sponsor, { status: 201 });
}