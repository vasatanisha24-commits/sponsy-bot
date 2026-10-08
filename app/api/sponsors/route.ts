import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// GET /api/sponsors — fetch all sponsors
export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { contacts: true },
    });
    return NextResponse.json(sponsors);
  } catch (err: any) {
    console.error('GET /api/sponsors error:', err);
    return NextResponse.json({ error: 'Failed to load sponsors.' }, { status: 500 });
  }
}

// Allowlist of fields accepted when creating a sponsor
const ALLOWED_CREATE_FIELDS = new Set([
  'companyName', 'website', 'industry', 'description',
  'tier', 'priority', 'status', 'assignedTo', 'contacts',
]);

// POST /api/sponsors — create a new sponsor
export async function POST(req: Request) {
  try {
    const rawBody = await req.json();

    // Validate required field
    if (!rawBody.companyName || typeof rawBody.companyName !== 'string' || !rawBody.companyName.trim()) {
      return NextResponse.json({ error: 'companyName is required.' }, { status: 400 });
    }

    // Strip fields not on the allowlist
    const body: Record<string, any> = {};
    for (const key of Object.keys(rawBody)) {
      if (ALLOWED_CREATE_FIELDS.has(key)) {
        body[key] = rawBody[key];
      }
    }

    // The frontend sends a user's name (e.g. "Tanisha Vasa") from constants.ts instead of a User ID.
    // Resolve name → ID; fall back to null if not found.
    if (body.assignedTo && typeof body.assignedTo === 'string') {
      // If it doesn't look like a cuid, try name lookup
      if (body.assignedTo.length < 20) {
        const user = await prisma.user.findFirst({ where: { name: body.assignedTo } });
        body.assignedTo = user ? user.id : null;
      }
    }

    const sponsor = await prisma.sponsor.create({ data: body as any });
    return NextResponse.json(sponsor, { status: 201 });
  } catch (err: any) {
    console.error('POST /api/sponsors error:', err);
    return NextResponse.json({ error: 'Failed to create sponsor.' }, { status: 500 });
  }
}