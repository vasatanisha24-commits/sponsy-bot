import { GoogleGenerativeAI } from '@google/generative-ai';
import { SponsorIntelligence } from './sponsor-intelligence';
import { SponsorScore } from './sponsor-scoring';

export interface GeneratedEmail {
  subject: string;
  body: string;
  confidenceScore: number;
}

/**
 * Generates a personalized outreach email based on sponsor intelligence and scoring.
 * Enforces strict JSON output for consumption by the frontend Human Approval UI.
 */
export async function generateOutreachEmail(
  intelligence: SponsorIntelligence,
  scoreInfo: SponsorScore,
  contactName: string,
  eventName: string = 'HackFest 2026',
  eventDetails: string = 'A 48-hour hackathon bringing together 500+ top student developers, engineers, and designers focused on open-source and AI.'
): Promise<GeneratedEmail> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY in environment.');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert partnership and sponsorship manager writing highly personalized outreach emails.
You will be provided with research about a company, a scoring profile, and event context.
Your goal is to write an engaging, professional, and personalized cold email asking for sponsorship.

Rules:
1. NEVER invent or hallucinate company facts, contact information, or past events.
2. Use the provided "Contact Name" to address the recipient.
3. Subtly weave in the "CSR Focus" or "Previous Sponsorships" if they exist, to show we did our research.
4. Pitch the "Recommended Ask" naturally.
5. Keep the email concise, warm, and professional (under 200 words).
6. Output MUST be valid JSON exactly matching the requested format. Do NOT include markdown blocks like \`\`\`json.
7. Include a "confidenceScore" (1-100) indicating how personalized and accurate you feel the email is based on the provided research.`,
  });

  const prompt = `
Context to use for the email:
- Event Name: ${eventName}
- Event Details: ${eventDetails}

Recipient Info:
- Contact Name: ${contactName}
- Company: ${intelligence.companyName}
- Industry: ${intelligence.industry}

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
  "body": "string (The full email body, formatted with line breaks using \\n. End with 'Best regards, HackFest Partnerships Team')",
  "confidenceScore": number (1-100)
}
`;

  const result = await model.generateContent(prompt);
  let responseText = result.response.text();
  
  // Clean up potential markdown formatting from Gemini response
  if (responseText.startsWith('\`\`\`json')) {
    responseText = responseText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
  }

  return JSON.parse(responseText) as GeneratedEmail;
}
