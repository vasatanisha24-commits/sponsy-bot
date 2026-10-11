import { NextResponse } from 'next/server';
import { generateSponsorIntelligence } from '@/app/lib/ai/sponsor-intelligence';
import { calculateSponsorScore } from '@/app/lib/ai/sponsor-scoring';
import {
  generateOutreachEmailWithRequirements,
} from '@/app/lib/ai/sponsor-email-generator';
import { prisma } from '@/app/lib/db';
import { CampaignRequirements } from '@/app/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sponsorId, campaignRequirements } = body as {
      sponsorId: string;
      campaignRequirements?: CampaignRequirements;
    };

    if (!sponsorId) {
      return NextResponse.json({ error: 'sponsorId is required' }, { status: 400 });
    }

    if (!campaignRequirements || typeof campaignRequirements !== 'object') {
      return NextResponse.json(
        { error: 'campaignRequirements is required to generate outreach email' },
        { status: 400 }
      );
    }

    // Validate required campaign requirement fields
    const requiredFields: (keyof CampaignRequirements)[] = [
      'eventName',
      'eventDescription',
      'sponsorshipAsk',
      'sponsorBenefits',
      'senderName',
      'senderRole',
      'organizationName',
      'contactInfo',
    ];
    const missing = requiredFields.filter(
      (f) => !campaignRequirements[f] || String(campaignRequirements[f]).trim() === ''
    );
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required campaign fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch Sponsor and Contact from DB
    const sponsor = await prisma.sponsor.findUnique({
      where: { id: sponsorId },
      include: { contacts: true },
    });

    if (!sponsor) {
      return NextResponse.json({ error: 'Sponsor not found' }, { status: 404 });
    }

    if (!sponsor.contacts || sponsor.contacts.length === 0) {
      return NextResponse.json({ error: 'Sponsor has no contacts. Cannot generate email.' }, { status: 400 });
    }

    const contact = sponsor.contacts[0];
    const companyName = sponsor.companyName;
    const website = sponsor.website || '';
    const contactName = contact.name;
    const contactId = contact.id;

    // 1. Research
    let intelligence;
    try {
      intelligence = await generateSponsorIntelligence(companyName, website);
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to generate sponsor intelligence (Tavily/Groq error)', details: err.message }, { status: 502 });
    }

    // 2. Score
    let score;
    try {
      score = await calculateSponsorScore(intelligence);
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to calculate sponsor score (Groq error)', details: err.message }, { status: 502 });
    }

    const sponsorContext = {
      description: sponsor.description,
      tier: sponsor.tier,
      website: sponsor.website,
      industry: sponsor.industry,
    };

    // 3. Generate email — use requirements-aware generator with validated campaign details
    let email;
    try {
      email = await generateOutreachEmailWithRequirements(
        intelligence,
        score,
        contactName,
        campaignRequirements,
        sponsorContext
      );
    } catch (err: any) {
      return NextResponse.json({ error: 'Failed to generate outreach email (Groq error)', details: err.message }, { status: 502 });
    }

    // 4. Save to database
    try {
      await prisma.$transaction(async (tx) => {
        await tx.research.create({
          data: {
            sponsorId,
            data: intelligence as any,
            summary: intelligence.summary,
            aiScore: score.score,
          },
        });

        await tx.email.create({
          data: {
            sponsorId,
            contactId,
            subject: email.subject,
            body: email.body,
            confidenceScore: email.confidenceScore,
            status: 'pending_review',
          },
        });

        // Update sponsor status and priority
        await tx.sponsor.update({
          where: { id: sponsorId },
          data: {
            status: 'outreach_pending',
            priority: score.priority.toLowerCase(),
          },
        });
      });

      return NextResponse.json({ intelligence, score, email });
    } catch (err: any) {
      return NextResponse.json({ error: 'Database error while saving research and email', details: err.message }, { status: 500 });
    }

  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request', details: err.message }, { status: 400 });
  }
}