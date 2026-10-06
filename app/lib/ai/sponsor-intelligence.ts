import { GoogleGenerativeAI } from '@google/generative-ai';
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

export async function generateSponsorIntelligence(
  companyName: string,
  website?: string
): Promise<SponsorIntelligence> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const tavilyApiKey = process.env.TAVILY_API_KEY;

  if (!geminiApiKey || !tavilyApiKey) {
    throw new Error('Missing GEMINI_API_KEY or TAVILY_API_KEY in environment.');
  }

  const searchClient = tavily({ apiKey: tavilyApiKey });
  const genAI = new GoogleGenerativeAI(geminiApiKey);

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

  // 2. Synthesize with Gemini
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are an expert partnership manager for a tech hackathon. 
Your job is to analyze search results for a potential sponsor and extract key intelligence.
You must output ONLY valid JSON matching the specified structure, without markdown blocks.
Do not invent facts. Only use information present in the provided search context. If something is unknown, state "Not found in search results."`,
  });

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

  const result = await model.generateContent(prompt);
  let responseText = result.response.text();
  
  // Clean up potential markdown formatting from Gemini response
  if (responseText.startsWith('\`\`\`json')) {
    responseText = responseText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
  }

  const parsed = JSON.parse(responseText) as Omit<SponsorIntelligence, 'sourceUrls'>;

  return {
    ...parsed,
    sourceUrls: urls,
  };
}
