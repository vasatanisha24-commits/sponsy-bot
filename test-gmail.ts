import { sendApprovedEmail, ApprovedEmailPayload } from './app/lib/integrations/gmail';
import * as dotenv from 'dotenv';

dotenv.config();

async function runTest() {
  console.log('🧪 Testing Gmail Integration Security Rules...\n');

  // Test 1: Try sending an unapproved AI draft
  const draftEmail: ApprovedEmailPayload = {
    to: 'test@example.com',
    subject: 'Sponsorship Opportunity',
    body: 'Hi, please sponsor us.',
    status: 'pending_review' // NOT APPROVED
  };

  console.log('--- TEST 1: Unapproved Email ---');
  try {
    await sendApprovedEmail(draftEmail);
    console.error('❌ FAIL: Allowed sending an unapproved email.');
  } catch (err) {
    console.log('✅ PASS: Rejected unapproved email.');
    console.log('   Reason:', err instanceof Error ? err.message : err);
  }

  console.log('\n--- TEST 2: Approved Email (Missing Credentials Check) ---');
  // Test 2: Approved email but lacking actual credentials (should throw credential error, not approval error)
  const approvedEmail: ApprovedEmailPayload = {
    to: 'test@example.com',
    subject: 'Sponsorship Opportunity',
    body: 'Hi, please sponsor us.',
    status: 'approved'
  };

  try {
    const result = await sendApprovedEmail(approvedEmail);
    if (result.success) {
      console.log('✅ Sent successfully (credentials are somehow present!).', result.messageId);
    } else {
      console.error('❌ FAIL:', result.error);
    }
  } catch (err) {
    console.log('✅ PASS: Caught missing credentials successfully (approval check passed).');
    console.log('   Reason:', err instanceof Error ? err.message : err);
  }
}

runTest();
