import { generateSponsorIntelligence } from './app/lib/ai/sponsor-intelligence';
import { calculateSponsorScore } from './app/lib/ai/sponsor-scoring';
import * as dotenv from 'dotenv';

// Load variables from .env if present
dotenv.config();

async function main() {
  const companyName = process.argv[2] || 'Vercel';
  const website = process.argv[3];

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

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    console.log('\nEnsure you have set GEMINI_API_KEY and TAVILY_API_KEY in your environment.');
  }
}

main();
