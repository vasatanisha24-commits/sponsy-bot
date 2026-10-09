import Groq from 'groq-sdk';
import { SponsorIntelligence } from './sponsor-intelligence';
import { SponsorScore } from './sponsor-scoring';
import { CampaignRequirements } from '@/app/lib/types';

export interface GeneratedEmail {
  subject: string;
  body: string;
  confidenceScore: number;
}

import { withExponentialBackoff, parseGroqJson } from './groq-utils';

function validateEmailGeneration(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.subject !== 'string') return false;
  if (typeof data.body !== 'string') return false;
  if (typeof data.confidenceScore !== 'number') return false;
  return true;
}

export interface SponsorContext {
  description?: string | null;
  tier?: string | null;
  website?: string | null;
  industry?: string | null;
}

/**
 * Generates a personalized outreach email based on sponsor intelligence and scoring.
 * Enforces strict JSON output for consumption by the frontend Human Approval UI.
 * @deprecated Prefer generateOutreachEmailWithRequirements which uses explicit user-supplied campaign details.
 */
export async function generateOutreachEmail(
  intelligence: SponsorIntelligence,
  scoreInfo: SponsorScore,
  contactName: string,
  sponsorContext?: SponsorContext,
  eventName?: string,
  eventDetails?: string
): Promise<GeneratedEmail> {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in environment.');
  }

  const groq = new Groq({ apiKey: groqApiKey });

  const systemInstruction = `You are an expert partnership and sponsorship manager writing highly personalized outreach emails.
You will be provided with research about a company, a scoring profile, and event context.
Your goal is to write an engaging, professional, and personalized cold email asking for sponsorship.

Rules:
1. NEVER invent or hallucinate company facts, contact information, or past events.
2. Use the provided "Contact Name" to address the recipient.
3. Subtly weave in the "CSR Focus" or "Previous Sponsorships" if they exist, to show we did our research.
4. Pitch the "Recommended Ask" naturally. Use the sponsorship tier when deciding the appropriate ask if provided.
5. Keep the email concise, warm, and professional (under 200 words).
6. Output MUST be valid JSON exactly matching the requested format. Do NOT include markdown blocks like \`\`\`json.
7. Include a "confidenceScore" (1-100) indicating how personalized and accurate you feel the email is based on the provided research.
8. Write a company-specific sponsorship email. Do not assume every sponsor wants the same type of sponsorship.
9. Do not mention HackFest unless "HackFest" is actually supplied as the event name.
10. Do not use a fixed event-specific sign-off. Use an appropriate professional sign-off based on the event name.`;

  const prompt = `
Context to use for the email:
${eventName ? `- Event Name: ${eventName}` : '- Event Name: Our upcoming event'}
${eventDetails ? `- Event Details: ${eventDetails}` : ''}

Recipient Info:
- Contact Name: ${contactName}
- Company: ${intelligence.companyName}
- Industry: ${sponsorContext?.industry || intelligence.industry}
${sponsorContext?.website ? `- Website: ${sponsorContext.website}` : ''}
${sponsorContext?.description ? `- Company Description: ${sponsorContext.description}` : ''}
${sponsorContext?.tier ? `- Sponsorship Tier: ${sponsorContext.tier}` : ''}

Company Intelligence:
- Summary: ${intelligence.summary}
- CSR Focus: ${intelligence.csrFocus}
- Past Sponsorships: ${intelligence.previousSponsorships}
- Why they are a good fit: ${intelligence.fitReasoning}
- The Ask: ${intelligence.recommendedAsk}

Sponsor Priority Score: ${scoreInfo.score}/100 (${scoreInfo.priority} Priority)

Please write the email and return exactly this JSON structure:
{
  "subject": "string (Catchy, professional subject line)",
  "body": "string (The full email body, formatted with line breaks using \\n. Use an appropriate sign-off.)",
  "confidenceScore": number (1-100)
}
`;

  const result = await withExponentialBackoff(async () => {
    console.log(`🤖 Requesting Groq email generation for ${intelligence.companyName}...`);
    const res = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' }
    });
    console.log('✅ Groq email response received.');
    return res;
  });

  const responseText = result.choices[0]?.message?.content || '';
  const parsed = parseGroqJson(responseText);

  if (!validateEmailGeneration(parsed)) {
    throw new Error('Groq returned invalid or missing keys for GeneratedEmail.');
  }

  return parsed as GeneratedEmail;
}

/**
 * Generates a personalized outreach email using explicit campaign requirements
 * supplied by the user and verified sponsor research.
 * Never invents campaign details, placeholder values, or missing information.
 */
export async function generateOutreachEmailWithRequirements(
  intelligence: SponsorIntelligence,
  scoreInfo: SponsorScore,
  contactName: string,
  requirements: CampaignRequirements,
  sponsorContext?: SponsorContext
): Promise<GeneratedEmail> {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in environment.');
  }

  const groq = new Groq({ apiKey: groqApiKey });

  const systemInstruction = `You are an expert partnership and sponsorship manager writing highly personalized outreach emails.
You will be provided with campaign requirements and verified research about the target company.

Generate the sponsorship email using the supplied campaign requirements and verified sponsor research. Never invent campaign details. Never use placeholder values. Never invent the sender, organization, event, date, participant count, sponsorship benefits, or contact information. If an optional field is missing, omit it naturally.

Rules:
1. Use ONLY the campaign details supplied in the requirements — never invent or hallucinate event names, dates, participant counts, benefits, sender identity, or contact information.
2. Use the provided "Contact Name" to address the recipient.
3. Subtly weave in verified "CSR Focus" or "Previous Sponsorships" from research only if they exist.
4. Present the sponsorship ask and benefits EXACTLY as supplied — do not rewrite, invent, or generalize them.
5. Sign off using the exact sender name, role, organization, and contact info provided.
6. Keep the email concise, warm, and professional (under 200 words).
7. Output MUST be valid JSON exactly matching the requested format. Do NOT include markdown blocks like \`\`\`json.
8. Include a "confidenceScore" (1-100) based on how well the verified research supports personalization.
9. Do not invent claims about the sponsor's previous activities unless supported by the research.
10. Never use placeholder text such as [Your Name], [Your Organization], [Contact Info], [Event Name], or similar.`;

  // Build optional lines only for fields that actually have values
  const optionalLines: string[] = [];
  if (requirements.expectedParticipants) {
    optionalLines.push(`- Expected Participants: ${requirements.expectedParticipants}`);
  }
  if (requirements.eventDate) {
    optionalLines.push(`- Event Date: ${requirements.eventDate}`);
  }
  if (requirements.specificRequest) {
    optionalLines.push(`- Specific Request / Amount / Resources: ${requirements.specificRequest}`);
  }
  if (requirements.additionalInstructions) {
    optionalLines.push(`- Additional Instructions: ${requirements.additionalInstructions}`);
  }

  const prompt = `
=== CAMPAIGN REQUIREMENTS (use these exactly) ===
- Event / Hackathon Name: ${requirements.eventName}
- Event Description: ${requirements.eventDescription}
- Sponsorship Ask: ${requirements.sponsorshipAsk}
- Sponsor Benefits / What We Offer: ${requirements.sponsorBenefits}
- Sender Name: ${requirements.senderName}
- Sender Role / Title: ${requirements.senderRole}
- Organization / Club Name: ${requirements.organizationName}
- Contact Information: ${requirements.contactInfo}
${optionalLines.length > 0 ? optionalLines.join('\n') : ''}

=== RECIPIENT (target company) ===
- Contact Name: ${contactName}
- Company: ${intelligence.companyName}
- Industry: ${sponsorContext?.industry || intelligence.industry}
${sponsorContext?.website ? `- Website: ${sponsorContext.website}` : ''}
${sponsorContext?.description ? `- Company Description: ${sponsorContext.description}` : ''}
${sponsorContext?.tier ? `- Sponsorship Tier: ${sponsorContext.tier}` : ''}

=== VERIFIED SPONSOR RESEARCH ===
- Summary: ${intelligence.summary}
- CSR Focus: ${intelligence.csrFocus}
- Past Sponsorships: ${intelligence.previousSponsorships}
- Why they are a good fit: ${intelligence.fitReasoning}
- Recommended Ask from research: ${intelligence.recommendedAsk}

Sponsor Priority Score: ${scoreInfo.score}/100 (${scoreInfo.priority} Priority)

Return exactly this JSON structure:
{
  "subject": "string (Catchy, professional subject line)",
  "body": "string (The full email body, formatted with line breaks using \\n. Sign off with the exact sender name, role, organization, and contact info provided above.)",
  "confidenceScore": number (1-100)
}
`;

  const result = await withExponentialBackoff(async () => {
    console.log(`🤖 Requesting Groq email generation (with requirements) for ${intelligence.companyName}...`);
    const res = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' }
    });
    console.log('✅ Groq email response (with requirements) received.');
    return res;
  });

  const responseText = result.choices[0]?.message?.content || '';
  const parsed = parseGroqJson(responseText);

  if (!validateEmailGeneration(parsed)) {
    throw new Error('Groq returned invalid or missing keys for GeneratedEmail.');
  }

  return parsed as GeneratedEmail;
}
