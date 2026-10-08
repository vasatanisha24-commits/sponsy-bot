import { prisma } from '@/app/lib/db';
import { EmailWithDetails } from '@/app/lib/types';
import ApprovalsPageClient from './ApprovalsPageClient';

export const dynamic = 'force-dynamic';

export default async function ApprovalsPage() {
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
      },
    });
    // Prisma returns Date objects; serialise to strings for the client
    emails = JSON.parse(JSON.stringify(raw)) as EmailWithDetails[];
  } catch (err: any) {
    fetchError = err?.message ?? 'Unknown database error';
  }

  return <ApprovalsPageClient initialEmails={emails} fetchError={fetchError} />;
}
