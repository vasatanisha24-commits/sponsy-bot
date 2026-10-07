import { NextResponse } from 'next/server';
import { generateSponsorIntelligence } from '@/app/lib/ai/sponsor-intelligence';
import { calculateSponsorScore } from '@/app/lib/ai/sponsor-scoring';
import { generateOutreachEmail } from '@/app/lib/ai/sponsor-email-generator';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
  const { companyName, website, contactName, sponsorId, contactId } = await req.json();

  // 1. Research
  const intelligence = await generateSponsorIntelligence(companyName, website);
  
  // 2. Score
  const score = await calculateSponsorScore(intelligence);
  
  // 3. Generate email
  const email = await generateOutreachEmail(intelligence, score, contactName);

  // 4. Save to database
  await prisma.research.create({
    data: {
      sponsorId,
      data: intelligence as object,
      summary: intelligence.summary,
      aiScore: score.score,
    },
  });

  await prisma.email.create({
    data: {
      sponsorId,
      contactId,
      subject: email.subject,
      body: email.body,
      confidenceScore: email.confidenceScore,
      status: 'pending_review',
    },
  });

  return NextResponse.json({ intelligence, score, email });
}