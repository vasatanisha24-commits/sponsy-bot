export function isRetryableError(error: any): boolean {
  const status = error?.status || error?.response?.status;
  if (status === 503 || status === 429 || status === 504 || status === 500) return true;
  
  const msg = (error?.message || '').toLowerCase();
  if (
    msg.includes('503') || 
    msg.includes('429') || 
    msg.includes('504') || 
    msg.includes('quota') || 
    msg.includes('overloaded') || 
    msg.includes('timeout') ||
    msg.includes('fetch failed') ||
    msg.includes('unavailable')
  ) {
    return true;
  }
  return false;
}

export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  timeoutMs: number = 15000
): Promise<T> {
  let attempt = 1;
  while (true) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Gemini API request timeout after ${timeoutMs / 1000} seconds.`)), timeoutMs)
      );
      
      return await Promise.race([
        operation(),
        timeoutPromise
      ]);
    } catch (error: any) {
      console.error(`⚠️ Gemini attempt ${attempt} failed:`, error?.message || error);
      
      if (!isRetryableError(error) || attempt >= maxRetries) {
        throw new Error(`Gemini API failed permanently after ${attempt} attempts. Error: ${error?.message || 'Unknown'}`);
      }
      
      // Exponential backoff: 2s, 4s, 8s, 16s... + jitter
      const baseDelay = Math.pow(2, attempt) * 1000;
      const jitter = Math.random() * 1000;
      const waitTime = baseDelay + jitter;
      
      console.log(`⏳ Waiting ${(waitTime / 1000).toFixed(1)} seconds before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
}

export function parseGeminiJson(responseText: string): any {
  let cleaned = responseText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleaned);
}
