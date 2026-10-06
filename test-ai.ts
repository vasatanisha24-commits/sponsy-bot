import { generateSponsorIntelligence } from './app/lib/ai/sponsor-intelligence';
import { calculateSponsorScore } from './app/lib/ai/sponsor-scoring';
import { generateOutreachEmail } from './app/lib/ai/sponsor-email-generator';
import * as dotenv from 'dotenv';

// Load variables from .env if present
dotenv.config();

async function main() {
  const companyName = process.argv[2] || 'Vercel';
  const website = process.argv[3];
  const contactName = 'Jane Doe'; // Mock contact for testing

  console.log(`\n🔍 Researching sponsor: ${companyName}...`);
  console.log('--------------------------------------------------');

  try {
    const intelligence = await generateSponsorIntelligence(companyName, website);
    
    console.log('\n✅ AI Intelligence Result:\n');
    console.log(JSON.stringify(intelligence, null, 2));

    console.log(`\n📊 Calculating Priority Score for ${companyName}...`);
    console.log('--------------------------------------------------');
    
    const scoreResult = await calculateSponsorScore(intelligence);
    
    console.log('\n✅ Scoring Result:\n');
    console.log(`Score: ${scoreResult.score}/100`);
    console.log(`Priority: ${scoreResult.priority}`);
    console.log(`Explanation: ${scoreResult.explanation}`);
    console.log('\nBreakdown:', JSON.stringify(scoreResult.breakdown, null, 2));

    console.log(`\n✉️ Generating Personalized Email to ${contactName}...`);
    console.log('--------------------------------------------------');

    const emailResult = await generateOutreachEmail(intelligence, scoreResult, contactName);

    console.log('\n✅ Email Generation Result:\n');
    console.log(`Subject: ${emailResult.subject}`);
    console.log(`Confidence: ${emailResult.confidenceScore}/100`);
    console.log('\nBody:\n');
    console.log(emailResult.body);

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nEnsure you have set GEMINI_API_KEY and TAVILY_API_KEY in your environment.');
  }
}

main();
