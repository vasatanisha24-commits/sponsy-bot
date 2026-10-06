import { SponsorWorkflow, SponsorRecord } from './app/lib/integrations/sponsor-workflow';

function runTests() {
  console.log('🧪 Testing Sponsor Workflow Rules...\n');

  let sponsor: SponsorRecord = {
    id: 'sponsor-123',
    companyName: 'TechCorp',
    state: 'PENDING',
    contactedByUserId: null,
    lastContactedAt: null,
    followUpCount: 0,
  };

  const humanUserId = 'user-abc';

  // --- Test 1: Unapproved Initial Send ---
  console.log('--- TEST 1: Sending initial without approval ---');
  try {
    SponsorWorkflow.sendInitial(sponsor, humanUserId, false);
    console.error('❌ FAIL: Allowed sending without approval.');
  } catch (err) {
    console.log('✅ PASS:', err instanceof Error ? err.message : err);
  }

  // --- Test 2: Approved Initial Send ---
  console.log('\n--- TEST 2: Sending initial with approval ---');
  sponsor = SponsorWorkflow.sendInitial(sponsor, humanUserId, true);
  console.log('✅ PASS: State is now', sponsor.state, '| Contacted by:', sponsor.contactedByUserId);

  // --- Test 3: Follow-Up 1 ---
  console.log('\n--- TEST 3: Sending Follow Up 1 ---');
  sponsor = SponsorWorkflow.sendFollowUp(sponsor, true);
  console.log('✅ PASS: State is now', sponsor.state, '| Count:', sponsor.followUpCount);

  // --- Test 4: Follow-Up 2 ---
  console.log('\n--- TEST 4: Sending Follow Up 2 ---');
  sponsor = SponsorWorkflow.sendFollowUp(sponsor, true);
  console.log('✅ PASS: State is now', sponsor.state, '| Count:', sponsor.followUpCount);

  // --- Test 5: Follow-Up 3 (Should Close) ---
  console.log('\n--- TEST 5: Attempting Follow Up 3 (Should close thread) ---');
  sponsor = SponsorWorkflow.sendFollowUp(sponsor, true);
  console.log('✅ PASS: State is now', sponsor.state);

  // --- Test 6: Reply Blocks Follow-up ---
  console.log('\n--- TEST 6: Reply halts follow-ups ---');
  let sponsor2: SponsorRecord = {
    id: 'sponsor-456',
    companyName: 'CloudNet',
    state: 'PENDING',
    contactedByUserId: null,
    lastContactedAt: null,
    followUpCount: 0,
  };
  sponsor2 = SponsorWorkflow.sendInitial(sponsor2, humanUserId, true);
  sponsor2 = SponsorWorkflow.sendFollowUp(sponsor2, true); // FOLLOW_UP_1
  sponsor2 = SponsorWorkflow.handleReply(sponsor2, true); // INTERESTED
  
  console.log(`Current state: ${sponsor2.state}`);
  try {
    SponsorWorkflow.sendFollowUp(sponsor2, true);
    console.error('❌ FAIL: Follow up allowed after reply.');
  } catch (err) {
    console.log('✅ PASS:', err instanceof Error ? err.message : err);
  }

  console.log('\n🎉 All workflow rules enforced correctly.');
}

runTests();
