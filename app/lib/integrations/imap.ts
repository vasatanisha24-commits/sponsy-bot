import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { prisma } from '@/app/lib/db';

export async function syncGmailInbox() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) {
    throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD is not set.');
  }

  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  let checkedCount = 0;
  let storedCount = 0;

  try {
    await client.connect();
    
    // Select INBOX
    const lock = await client.getMailboxLock('INBOX');
    try {
      // Fetch messages from the last 7 days to avoid parsing the entire inbox
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 7);
      
      const searchRequest = { since: sinceDate };
      
      // We only need UID and source (to parse headers/body)
      for await (const message of client.fetch(searchRequest, { source: true })) {
        checkedCount++;
        
        if (!message.source) continue;
        
        const parsed = await simpleParser(message.source);
        const inReplyTo = parsed.inReplyTo;
        
        if (!inReplyTo) continue; // Not a reply
        
        // Find if this is a reply to one of our sent emails
        const originalEmail = await prisma.email.findFirst({
          where: { messageId: inReplyTo },
          include: { sponsor: true },
        });

        if (!originalEmail) continue; // Not a reply to our tracked emails

        const messageId = parsed.messageId;
        if (!messageId) continue;

        // Ensure we don't save duplicates
        const existingReply = await prisma.reply.findUnique({
          where: { messageId },
        });

        if (existingReply) continue;

        // Save the matched reply
        const sender = parsed.from?.value[0]?.address || 'unknown@example.com';
        const receivedAt = parsed.date || new Date();
        const subject = parsed.subject || 'No Subject';
        const body = parsed.text || '';

        await prisma.reply.create({
          data: {
            emailId: originalEmail.id,
            sponsorId: originalEmail.sponsorId,
            messageId,
            subject,
            body,
            senderEmail: sender,
            receivedAt,
          }
        });

        storedCount++;
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return { checkedCount, storedCount };
}
