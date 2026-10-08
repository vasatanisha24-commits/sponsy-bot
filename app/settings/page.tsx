import { prisma } from '@/app/lib/db';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  // Fetch the first operator user (since there is no auth yet)
  const user = await prisma.user.findFirst();

  // Read environment settings
  const envSettings = {
    gmailUser: process.env.GMAIL_USER || 'Not configured',
    hasGmailPassword: !!process.env.GMAIL_APP_PASSWORD,
    groqConfigured: !!process.env.GROQ_API_KEY,
  };

  return (
    <SettingsClient 
      user={user ? JSON.parse(JSON.stringify(user)) : null} 
      envSettings={envSettings} 
    />
  );
}
