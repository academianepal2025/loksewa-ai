import { createClient } from '@/lib/supabase/server';

// Model pricing per 1 Million tokens
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'gemini-2.5-flash': { input: 0.30, output: 2.50 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'gemini-3.1-flash-lite-preview': { input: 0.25, output: 1.50 },
};

const DEFAULT_LOGGER_MODEL = 'gemini-2.5-flash-lite';

export async function logAiUsage(params: {
  userId: string;
  feature: string;
  inputTokens?: number;
  outputTokens?: number;
  model?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Fallback estimates if token counts aren't perfectly available from the API stream
    // These are rough averages based on feature type
    let estimatedInput = params.inputTokens || 0;
    let estimatedOutput = params.outputTokens || 0;

    if (!estimatedInput && !estimatedOutput) {
      switch(params.feature) {
        case 'chat': estimatedInput = 1000; estimatedOutput = 300; break;
        case 'quiz': estimatedInput = 2000; estimatedOutput = 1000; break;
        case 'notes': estimatedInput = 5000; estimatedOutput = 1500; break;
        case 'study_plan': estimatedInput = 2500; estimatedOutput = 800; break;
        default: estimatedInput = 500; estimatedOutput = 200; break;
      }
    }

    const modelUsed = params.model || DEFAULT_LOGGER_MODEL;
    const pricing = MODEL_PRICING[modelUsed] || MODEL_PRICING[DEFAULT_LOGGER_MODEL];

    const costEstimate = 
      ((estimatedInput / 1000000) * pricing.input) +
      ((estimatedOutput / 1000000) * pricing.output);

    await supabase.from('ai_usage_logs').insert({
      user_id: params.userId,
      feature: params.feature,
      input_tokens: estimatedInput,
      output_tokens: estimatedOutput,
      model: modelUsed,
      cost_estimate: costEstimate
    });

  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}
