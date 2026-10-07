import { sendApprovedEmail } from './app/lib/integrations/gmail';
import * as dotenv from 'dotenv';
dotenv.config();

sendApprovedEmail({
  to: 'vasa.tanisha24@gmail.com',  // send to yourself to test
  subject: 'HackFest 2026 Test Email',
  body: 'This is a test from Sponsy Bot. If you see this, Gmail is working!',
  status: 'approved',  // MUST be approved
}).then(result => {
  if (result.success) {
    console.log('✅ Email sent! Message ID:', result.messageId);
  } else {
    console.error('❌ Failed:', result.error);
  }
});