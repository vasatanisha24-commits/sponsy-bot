import { MOCK_EMAILS } from '@/app/lib/mock-data';
import ApprovalsPageClient from './ApprovalsPageClient';

export default function ApprovalsPage() {
  return <ApprovalsPageClient initialEmails={MOCK_EMAILS} />;
}
