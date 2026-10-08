import Groq from 'groq-sdk';
import { SponsorIntelligence } from './sponsor-intelligence';

export interface SponsorScore {
  score: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  explanation: string;
  breakdown: {
    industryRelevance: number;
    previousSponsorships: number;
    csrAlignment: number;
    audienceFit: number;
    askFit: number;
  };
}

import { withExponentialBackoff, parseGroqJson } from './groq-utils';

function validateSponsorScore(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  const requiredKeys = ['industryRelevance', 'previousSponsorships', 'csrAlignment', 'audienceFit', 'askFit'];
  if (!requiredKeys.every(k => typeof data[k] === 'number')) return false;
  if (typeof data.explanation !== 'string') return false;
  return true;
}

/**
 * Calculates a transparent sponsor score using AI for evaluating criteria,
 * but deterministic math for the final score and priority.
 */
export async function calculateSponsorScore(
  intelligence: SponsorIntelligence
): Promise<SponsorScore> {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw new Error('Missing GROQ_API_KEY in environment.');
  }

  const groq = new Groq({ apiKey: groqApiKey });

  // 1. AI evaluates individual criteria based on the intelligence
  const systemInstruction = `You are an objective hackathon sponsorship evaluator. 
You will receive intelligence about a potential sponsor.
Rate them on a scale of 1 to 10 for each of the following 5 criteria:
- Industry Relevance
- Previous Sponsorships
- CSR Alignment
- Event Audience Fit (how well they fit a student developer/engineer audience)
- Sponsorship/Ask Fit (how realistic the recommended ask is)
Also provide a short 1-2 sentence explanation summarizing the rationale behind your ratings.
Output MUST be valid JSON exactly matching the requested format. Do NOT include markdown blocks like \`\`\`json.`;

  const prompt = `
Evaluate this sponsor based on the following intelligence:
Company: ${intelligence.companyName}
Industry: ${intelligence.industry}
Summary: ${intelligence.summary}
CSR Focus: ${intelligence.csrFocus}
Previous Sponsorships: ${intelligence.previousSponsorships}
Recommended Ask: ${intelligence.recommendedAsk}
Fit Reasoning: ${intelligence.fitReasoning}

Return exactly this JSON structure:
{
  "industryRelevance": number (1-10),
  "previousSponsorships": number (1-10),
  "csrAlignment": number (1-10),
  "audienceFit": number (1-10),
  "askFit": number (1-10),
  "explanation": "string (Short 1-2 sentence explanation of the ratings)"
}
`;

  const result = await withExponentialBackoff(async () => {
    console.log(`🤖 Requesting Groq scoring for ${intelligence.companyName}...`);
    const res = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' }
    });
    console.log('✅ Groq scoring response received.');
    return res;
  });

  const responseText = result.choices[0]?.message?.content || '';
  const ratings = parseGroqJson(responseText);

  if (!validateSponsorScore(ratings)) {
    throw new Error('Groq returned invalid or missing keys for SponsorScore ratings.');
  }

  // 2. Deterministic math for the final score out of 100
  // Weights: 
  // Industry relevance — 25% (x 2.5)
  // Previous sponsorships/partnerships — 20% (x 2.0)
  // CSR alignment — 20% (x 2.0)
  // Event audience fit — 20% (x 2.0)
  // Sponsorship/ask fit — 15% (x 1.5)
  
  const score = Math.round(
    (ratings.industryRelevance * 2.5) +
    (ratings.previousSponsorships * 2.0) +
    (ratings.csrAlignment * 2.0) +
    (ratings.audienceFit * 2.0) +
    (ratings.askFit * 1.5)
  );

  // 3. Priority mapping
  let priority: 'HIGH' | 'MEDIUM' | 'LOW';
  if (score >= 75) {
    priority = 'HIGH';
  } else if (score >= 50) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  return {
    score,
    priority,
    explanation: ratings.explanation,
    breakdown: {
      industryRelevance: ratings.industryRelevance,
      previousSponsorships: ratings.previousSponsorships,
      csrAlignment: ratings.csrAlignment,
      audienceFit: ratings.audienceFit,
      askFit: ratings.askFit,
    }
  };
}
