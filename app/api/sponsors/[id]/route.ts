import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

// DELETE /api/sponsors/[id] — permanently delete a sponsor and all related records
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid sponsor ID.' }, { status: 400 });
  }

  try {
    const sponsor = await prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    // Delete in dependency order: FollowUps → Emails → Contacts → Research → Sponsor
    const emailIds = await prisma.email
      .findMany({ where: { sponsorId: id }, select: { id: true } })
      .then((rows) => rows.map((r) => r.id));

    if (emailIds.length > 0) {
      await prisma.followUp.deleteMany({ where: { emailId: { in: emailIds } } });
    }
    await prisma.email.deleteMany({ where: { sponsorId: id } });
    await prisma.contact.deleteMany({ where: { sponsorId: id } });
    await prisma.research.deleteMany({ where: { sponsorId: id } });
    await prisma.sponsor.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE /api/sponsors/[id]]', err);
    return NextResponse.json(
      { error: 'Failed to delete sponsor.' },
      { status: 500 }
    );
  }
}

// Allowlist of fields that may be updated via PATCH.
// This prevents mass-assignment of internal/relational fields.
const PATCHABLE_FIELDS = new Set([
  'companyName', 'website', 'industry', 'description',
  'tier', 'priority', 'status', 'assignedTo',
]);

const VALID_STATUSES = new Set([
  'new', 'researched', 'outreach_pending', 'contacted',
  'follow_up', 'approved', 'declined', 'follow_up_exhausted',
]);

const VALID_PRIORITIES = new Set(['low', 'medium', 'high']);
const VALID_TIERS = new Set(['bronze', 'silver', 'gold', 'platinum', null, undefined]);

// PATCH /api/sponsors/[id] — update sponsor fields (status, priority, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid sponsor ID.' }, { status: 400 });
  }

  try {
    const rawBody = await req.json();

    // Strip any keys not on the allowlist (mass-assignment protection)
    const data: Record<string, any> = {};
    for (const key of Object.keys(rawBody)) {
      if (PATCHABLE_FIELDS.has(key)) {
        data[key] = rawBody[key];
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
    }

    // Validate enum-like fields
    if (data.status !== undefined && !VALID_STATUSES.has(data.status)) {
      return NextResponse.json({ error: `Invalid status value: '${data.status}'.` }, { status: 400 });
    }
    if (data.priority !== undefined && !VALID_PRIORITIES.has(data.priority)) {
      return NextResponse.json({ error: `Invalid priority value: '${data.priority}'.` }, { status: 400 });
    }
    if (data.tier !== undefined && !VALID_TIERS.has(data.tier)) {
      return NextResponse.json({ error: `Invalid tier value: '${data.tier}'.` }, { status: 400 });
    }

    // If assignedTo is a name string, resolve to a User ID
    if (data.assignedTo && typeof data.assignedTo === 'string' && !data.assignedTo.startsWith('c')) {
      const user = await prisma.user.findFirst({ where: { name: data.assignedTo } });
      data.assignedTo = user ? user.id : null;
    }

    const sponsor = await prisma.sponsor.findUnique({ where: { id } });
    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found.' }, { status: 404 });
    }

    const updated = await prisma.sponsor.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[PATCH /api/sponsors/[id]]', err);
    return NextResponse.json({ error: 'Failed to update sponsor.' }, { status: 500 });
  }
}
