import { prisma } from '@/app/lib/db';
import { ReplyWithDetails } from '@/app/lib/types';
import RepliesClient from './RepliesClient';

export const dynamic = 'force-dynamic';

export default async function RepliesPage() {
  let replies: ReplyWithDetails[] = [];
  let fetchError: string | null = null;

  try {
    const raw = await prisma.reply.findMany({
      orderBy: { receivedAt: 'desc' },
      include: {
        sponsor: { select: { id: true, companyName: true } },
        email: { select: { id: true, subject: true } },
      },
    });
    // Serialize Date objects for the Client Component
    replies = JSON.parse(JSON.stringify(raw)) as ReplyWithDetails[];
  } catch (err: any) {
    fetchError = err?.message ?? 'Unknown database error';
  }

  return <RepliesClient initialReplies={replies} fetchError={fetchError} />;
}
