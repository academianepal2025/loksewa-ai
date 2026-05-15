import { createClient } from '@/lib/supabase/server';

// Current pricing for Gemini 1.5 Flash (per 1M tokens)
const GEMINI_FLASH_INPUT_PRICE = 0.075;
const GEMINI_FLASH_OUTPUT_PRICE = 0.30;

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

    const costEstimate = 
      ((estimatedInput / 1000000) * GEMINI_FLASH_INPUT_PRICE) +
      ((estimatedOutput / 1000000) * GEMINI_FLASH_OUTPUT_PRICE);

    await supabase.from('ai_usage_logs').insert({
      user_id: params.userId,
      feature: params.feature,
      input_tokens: estimatedInput,
      output_tokens: estimatedOutput,
      model: params.model || 'gemini-1.5-flash',
      cost_estimate: costEstimate
    });

  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}
