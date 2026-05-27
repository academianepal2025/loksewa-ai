import { GoogleGenAI } from '@google/genai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const FALLBACK_MODEL = 'gemini-2.5-flash';

function sanitizeAIError(error: any): Error {
  const msg = error.message || String(error);
  if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
    return new Error('AI service is at capacity. Please try again in a moment.');
  }
  if (msg.includes('503') || msg.includes('unavailable')) {
    return new Error('AI service is temporarily unavailable. Please try again.');
  }
  if (msg.includes('API_KEY') || msg.includes('PERMISSION_DENIED')) {
    return new Error('AI service configuration error. Please contact support.');
  }
  return new Error('AI generation failed. Please try again.');
}

// ── Request Queue Logic (Handles API Rate Limits) ──────────────────────
class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 4500; // 4.5 seconds as requested

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLast = now - this.lastRequestTime;
      
      if (timeSinceLast < this.minInterval) {
        const wait = this.minInterval - timeSinceLast;
        await new Promise(resolve => setTimeout(resolve, wait));
      }

      const task = this.queue.shift();
      if (task) {
        await task();
        this.lastRequestTime = Date.now();
      }
    }

    this.processing = false;
  }
}

const globalQueue = new RequestQueue();

// ── Retry Wrapper Logic ──────────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message || JSON.stringify(error);
      const isRateLimit = 
        errorMsg.includes('429') || 
        errorMsg.includes('RESOURCE_EXHAUSTED') || 
        errorMsg.includes('high demand') ||
        errorMsg.includes('503') ||
        errorMsg.includes('quota') ||
        error.status === 429 ||
        error.status === 503;

      if (!isRateLimit || attempt === maxRetries) {
        throw sanitizeAIError(error);
      }

      // Calculate exponential backoff
      let delay = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
      
      // Extract suggested delay if present (e.g., "retry in 32s")
      const retryMatch = errorMsg.match(/retry in (\d+\.?\d*)s/i);
      if (retryMatch) {
        delay = parseFloat(retryMatch[1]) * 1000;
      }

      delay = Math.min(delay, 25000); // Cap at 25s for faster fallback
      
      console.log(`[AI RETRY] Attempt ${attempt + 1}/${maxRetries} failed due to API limits. Waiting ${Math.round(delay/1000)}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw sanitizeAIError(lastError);
}

// ── Public AI Functions ──────────────────────────────────────────────

/**
 * Generates structured JSON data from Gemini
 */
export async function generateJSON(systemPrompt: string, contents: any, modelToUse = DEFAULT_MODEL): Promise<any> {
  try {
    return await globalQueue.add(() => withRetry(async () => {
      const result = await ai.models.generateContent({
        model: modelToUse,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
        contents: contents,
      });

      let text = result.text || '';
      
      // Clean markdown code fences if present
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();

      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn('[AI JSON Parse] Failed to parse response. Attempting to extract JSON...');
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse Gemini response as valid JSON.');
      }
    }));
  } catch (error) {
    if (modelToUse === DEFAULT_MODEL) {
      console.warn(`[AI FALLBACK] ${DEFAULT_MODEL} failed. Falling back to ${FALLBACK_MODEL}...`);
      return generateJSON(systemPrompt, contents, FALLBACK_MODEL);
    }
    throw error;
  }
}

/**
 * Generates JSON from Gemini with Multimodal (Vision) support
 */
export async function generateMultimodalJSON(systemPrompt: string, userText: string, media: { mimeType: string; data: string }[], modelToUse = DEFAULT_MODEL): Promise<any> {
  try {
    return await globalQueue.add(() => withRetry(async () => {
      const parts = [{ text: userText }];
      media.forEach(m => parts.push({ inlineData: m } as any));

      const result = await ai.models.generateContent({
        model: modelToUse,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.1, // Lower for precision in grading
        },
        contents: [{ role: 'user', parts }],
      });

      const text = result.text || '';
      try {
        return JSON.parse(text);
      } catch (e) {
        // Handle potential code block markers in response
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText);
      }
    }));
  } catch (error) {
    if (modelToUse === DEFAULT_MODEL) {
      console.warn(`[AI MULTIMODAL FALLBACK] ${DEFAULT_MODEL} failed. Falling back to ${FALLBACK_MODEL}...`);
      return generateMultimodalJSON(systemPrompt, userText, media, FALLBACK_MODEL);
    }
    throw error;
  }
}

/**
 * Generates plain text response from Gemini
 */
export async function generateText(systemPrompt: string, contents: any, modelToUse = DEFAULT_MODEL): Promise<string> {
  try {
    return await globalQueue.add(() => withRetry(async () => {
      const result = await ai.models.generateContent({
        model: modelToUse,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
        contents: contents,
      });

      return result.text || '';
    }));
  } catch (error) {
    if (modelToUse === DEFAULT_MODEL) {
      console.warn(`[AI FALLBACK] ${DEFAULT_MODEL} failed. Falling back to ${FALLBACK_MODEL}...`);
      return generateText(systemPrompt, contents, FALLBACK_MODEL);
    }
    throw error;
  }
}

/**
 * Streams chat response from Gemini (skips queue for interactivity)
 */
export async function streamText(systemPrompt: string, conversationHistory: any[], modelToUse = DEFAULT_MODEL): Promise<any> {
  try {
    return await withRetry(async () => {
      return ai.chats.create({
        model: modelToUse,
        config: {
          systemInstruction: systemPrompt,
        },
        history: conversationHistory,
      });
    });
  } catch (error) {
    if (modelToUse === DEFAULT_MODEL) {
      console.warn(`[AI FALLBACK] ${DEFAULT_MODEL} failed. Falling back to ${FALLBACK_MODEL}...`);
      return streamText(systemPrompt, conversationHistory, FALLBACK_MODEL);
    }
    throw error;
  }
}

/**
 * Generates vector embedding for document retrieval
 */
export async function generateEmbedding(text: string) {
  return globalQueue.add(() => withRetry(async () => {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: 768,
      },
    });

    return result.embeddings?.[0]?.values || [];
  }));
}

/**
 * Generates vector embedding for search queries (skips queue for speed)
 */
export async function generateQueryEmbedding(text: string) {
  return withRetry(async () => {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: 768,
      },
    });

    return result.embeddings?.[0]?.values || [];
  });
}
