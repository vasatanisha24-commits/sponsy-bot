import { prisma } from '@/app/lib/db';
import { sendViaGmail } from './gmail';

/**
 * processFollowUps()
 *
 * Finds sent emails whose sponsors have not replied and creates FollowUp
 * records in 'pending_review' state (requiring human approval before sending).
 *
 * Safety rules:
 *  - Max TWO follow-ups per email (enforced server-side).
 *  - Never creates a follow-up if one is already pending/draft.
 *  - Stops entirely if the sponsor has replied/declined.
 *  - Never auto-sends — FollowUp is created in pending_review only.
 *  - skipWaitCheck=true is TEST-ONLY; production callers must omit it.
 */
const WAIT_TIME_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export async function processFollowUps(skipWaitCheck = false) {
  // 1. Find emails that have been sent, but the sponsor hasn't replied.
  const eligibleEmails = await prisma.email.findMany({
    where: {
      status: 'sent',
      sponsor: {
        status: {
          notIn: ['replied', 'interested', 'approved', 'declined', 'follow_up_exhausted'],
        },
      },
      replies: { none: {} },
    },
    include: {
      sponsor: true,
      followUps: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const actions = [];

  for (const email of eligibleEmails) {
    const followUps = email.followUps;
    const followUpCount = followUps.length;

    // ── Enforce max 2 follow-ups (server-side hard limit) ──────────────────
    if (followUpCount >= 2) {
      const lastFollowUp = followUps[followUps.length - 1];
      if (lastFollowUp.status === 'sent') {
        await prisma.sponsor.update({
          where: { id: email.sponsorId },
          data: { status: 'follow_up_exhausted' },
        });
        actions.push({ emailId: email.id, action: 'closed_max_followups' });
      }
      continue;
    }

    // Determine the last touch timestamp
    const lastTouchAt = followUpCount > 0
      ? followUps[followUps.length - 1].sentAt
      : email.sentAt;

    if (!lastTouchAt) continue;

    const timeElapsed = Date.now() - lastTouchAt.getTime();

    // skipWaitCheck is TEST-ONLY to bypass the 3-day production wait
    const readyForNext = skipWaitCheck || (timeElapsed > WAIT_TIME_MS);

    if (readyForNext) {
      // Don't create if there's already one pending
      const hasPending = followUps.some(f => f.status === 'pending_review' || f.status === 'draft');
      if (hasPending) continue;

      const nextNumber = followUpCount + 1;
      await prisma.$transaction(async (tx) => {
        await tx.followUp.create({
          data: {
            emailId: email.id,
            subject: `Re: ${email.subject}`,
            body: `Hi there,\n\nJust following up on my previous email. Let me know if you have any questions!\n\nBest,\nHackFest Team`,
            status: 'pending_review',
            scheduledFor: new Date(),
          },
        });

        await tx.sponsor.update({
          where: { id: email.sponsorId },
          data: { status: 'follow_up' },
        });
      });
      actions.push({ emailId: email.id, action: `created_follow_up_${nextNumber}` });
    }
  }

  return actions;
}

/**
 * Approve a FollowUp
 */
export async function approveFollowUp(followUpId: string, subject: string, body: string) {
  const followUp = await prisma.followUp.findUnique({ where: { id: followUpId } });
  if (!followUp) throw new Error('FollowUp not found');
  if (followUp.status === 'sent') throw new Error('Already sent');

  return prisma.followUp.update({
    where: { id: followUpId },
    data: {
      subject,
      body,
      status: 'approved',
    },
  });
}

/**
 * Send an approved FollowUp
 */
export async function sendApprovedFollowUp(followUpId: string) {
  const followUp = await prisma.followUp.findUnique({
    where: { id: followUpId },
    include: {
      email: {
        include: { contact: true }
      }
    }
  });

  if (!followUp) throw new Error('FollowUp not found');
  if (followUp.status !== 'approved') throw new Error(`FollowUp status is ${followUp.status}, must be approved`);
  
  if (!followUp.subject || !followUp.body) throw new Error('FollowUp missing subject or body');

  const result = await sendViaGmail({
    to: followUp.email.contact.email,
    subject: followUp.subject,
    body: followUp.body,
    dbStatus: followUp.status, 
  });

  if (!result.success) {
    throw new Error(result.error);
  }

  return prisma.followUp.update({
    where: { id: followUpId },
    data: {
      status: 'sent',
      sentAt: new Date(),
    },
  });
}
