import Groq from 'groq-sdk';
import { tavily } from '@tavily/core';

export interface SponsorIntelligence {
  companyName: string;
  industry: string;
  summary: string;
  csrFocus: string;
  previousSponsorships: string;
  fitReasoning: string;
  recommendedAsk: string;
  sourceUrls: string[];
}

import { withExponentialBackoff, parseGroqJson } from './groq-utils';

function validateSponsorIntelligence(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  const requiredKeys = ['companyName', 'industry', 'summary', 'csrFocus', 'previousSponsorships', 'fitReasoning', 'recommendedAsk'];
  return requiredKeys.every(k => typeof data[k] === 'string');
}

export async function generateSponsorIntelligence(
  companyName: string,
  website?: string
): Promise<SponsorIntelligence> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!groqApiKey || !tavilyApiKey) {
    throw new Error('Missing GROQ_API_KEY or TAVILY_API_KEY in environment.');
  }

  const searchClient = tavily({ apiKey: tavilyApiKey });
  const groq = new Groq({ apiKey: groqApiKey });

  // 1. Search for intelligence via Tavily
  const query = `${companyName} corporate social responsibility hackathon sponsorship developer events community programs`;
  
  const searchResults = await searchClient.search(query, {
    searchDepth: 'basic',
    includeAnswer: false,
    maxResults: 5,
  });

  const urls = searchResults.results.map((r) => r.url);
  const contextText = searchResults.results
    .map((r) => `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content}`)
    .join('\n\n');

  // 2. Synthesize with Groq
  const systemInstruction = `You are an expert partnership manager for a tech hackathon. 
Your job is to analyze search results for a potential sponsor and extract key intelligence.
You must output ONLY valid JSON matching the specified structure, without markdown blocks.
Do not invent facts. Only use information present in the provided search context. If something is unknown, state "Not found in search results."`;

  const prompt = `
Analyze the following search context for the company "${companyName}" ${website ? `(Website: ${website})` : ''}.

Return a JSON object with EXACTLY these keys:
- "companyName": String (The name of the company)
- "industry": String (The company's primary industry)
- "summary": String (A 2-sentence summary of what they do)
- "csrFocus": String (Their corporate social responsibility, philanthropic, or developer community focus)
- "previousSponsorships": String (Any mention of them sponsoring hackathons, conferences, or student events)
- "fitReasoning": String (Why they would be a good fit to sponsor a student hackathon)
- "recommendedAsk": String (A recommended sponsorship ask or angle based on their interests)

Search Context:
${contextText}
`;

  const result = await withExponentialBackoff(async () => {
    console.log(`🤖 Requesting Groq intelligence for ${companyName}...`);
    const res = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      model: 'openai/gpt-oss-120b',
      response_format: { type: 'json_object' }
    });
    console.log('✅ Groq response received.');
    return res;
  });

  const responseText = result.choices[0]?.message?.content || '';
  const parsed = parseGroqJson(responseText);

  if (!validateSponsorIntelligence(parsed)) {
    throw new Error('Groq returned invalid or missing keys for SponsorIntelligence.');
  }

  return {
    ...(parsed as Omit<SponsorIntelligence, 'sourceUrls'>),
    sourceUrls: urls,
  };
}
