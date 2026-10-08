import { NextResponse } from 'next/server';
import { syncGmailInbox } from '@/app/lib/integrations/imap';

// POST /api/replies/sync — manually trigger Gmail inbox sync for sponsor replies.
// Reads recent inbox messages, matches In-Reply-To against sent Email.messageId,
// and saves matched messages as Reply records. Never sends or deletes emails.
export async function POST() {
  try {
    const { checkedCount, storedCount } = await syncGmailInbox();
    return NextResponse.json({ checkedCount, storedCount });
  } catch (err: any) {
    console.error('[POST /api/replies/sync]', err);
    const isConfig = err.message?.includes('GMAIL_USER') || err.message?.includes('GMAIL_APP_PASSWORD');
    return NextResponse.json(
      { error: err.message ?? 'Unknown error during inbox sync.' },
      { status: isConfig ? 503 : 500 }
    );
  }
}
