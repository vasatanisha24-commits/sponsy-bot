import { prisma } from '@/app/lib/db';
import OutreachClient from './OutreachClient';
import { EmailWithDetails } from '@/app/lib/types';

export const dynamic = 'force-dynamic';

export default async function OutreachPage() {
  let emails: EmailWithDetails[] = [];
  let fetchError: string | null = null;

  try {
    const raw = await prisma.email.findMany({
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
        followUps: true,
      },
    });
    // Serialize dates for Client Component
    emails = JSON.parse(JSON.stringify(raw)) as EmailWithDetails[];
  } catch (err: any) {
    fetchError = err?.message ?? 'Unknown database error';
  }

  return <OutreachClient initialEmails={emails} fetchError={fetchError} />;
}
