import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

type Outcome = 'interested' | 'declined' | 'needs_review';

// PATCH /api/replies/[id]/classify
// Classifies a reply as interested / declined / needs_review and updates
// the linked Sponsor status accordingly. Never sends any email.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid reply ID.' }, { status: 400 });
  }

  let outcome: Outcome;
  try {
    const body = await req.json();
    if (!['interested', 'declined', 'needs_review'].includes(body.outcome)) {
      return NextResponse.json(
        { error: "outcome must be 'interested', 'declined', or 'needs_review'." },
        { status: 400 }
      );
    }
    outcome = body.outcome as Outcome;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    const reply = await prisma.reply.findUnique({ where: { id } });
    if (!reply) {
      return NextResponse.json({ error: 'Reply not found.' }, { status: 404 });
    }

    // Determine the new Sponsor status based on outcome.
    // 'replied'   → already excluded by processFollowUps() — stops further follow-ups.
    // 'declined'  → already excluded by processFollowUps() — stops further follow-ups.
    // needs_review → no change to sponsor status; stays as-is for human review.
    const sponsorStatusMap: Record<Outcome, string | null> = {
      interested: 'interested',
      declined: 'declined',
      needs_review: null,
    };

    const newSponsorStatus = sponsorStatusMap[outcome];

    await prisma.$transaction(async (tx) => {
      // 1. Persist the human classification on the Reply record.
      await tx.reply.update({
        where: { id },
        data: { outcome },
      });

      // 2. Update the Sponsor status only when outcome is conclusive.
      if (newSponsorStatus) {
        await tx.sponsor.update({
          where: { id: reply.sponsorId },
          data: { status: newSponsorStatus },
        });
      }
    });

    return NextResponse.json({ id, outcome });
  } catch (err: any) {
    console.error('[PATCH /api/replies/[id]/classify]', err);
    return NextResponse.json({ error: 'Failed to classify reply.' }, { status: 500 });
  }
}
