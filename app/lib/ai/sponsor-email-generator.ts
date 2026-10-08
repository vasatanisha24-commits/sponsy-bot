import Groq from 'groq-sdk';
import { SponsorIntelligence } from './sponsor-intelligence';
import { SponsorScore } from './sponsor-scoring';

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
