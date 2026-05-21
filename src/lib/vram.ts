// src/lib/vram.ts

export interface BudgetInputs {
  vramGB: number;        // total GPU VRAM
  contextTokens: number; // context length
  batchSize: number;     // concurrent requests
  headroomPct: number;   // safety headroom 5-40
  refParams?: number;    // reference param count for KV cache estimate (default 13)
}

export interface Budget {
  total: number;
  kvCache: number;
  framework: number;
  safety: number;
  weightsBudget: number; // what's left for model weights
  budgetPct: number;     // weightsBudget / total × 100
}

export type FitClass = 'fits' | 'tight' | 'over';

/**
 * Weight size in GB. The whole thesis of the site.
 * params: billions. bits: effective bits per weight.
 */
export function modelSizeGB(params: number, bits: number): number {
  return params * (bits / 8);
}

/**
 * KV cache estimate.
 * Order-of-magnitude: ~0.5 MB per 1B params per 1K tokens, scaled by batch.
 * Real values depend heavily on GQA/MQA, head dim, num layers.
 * GQA models (Llama 3, Mistral) use 30-60% less than this estimate.
 * Keep conservative — better to over-budget than crash at token 4000.
 */
export function kvCacheGB(
  contextTokens: number,
  batchSize: number,
  refParams: number = 13
): number {
  return refParams * (contextTokens / 1024) * batchSize * 0.0005;
}

/**
 * Framework overhead: CUDA context, kernels, allocator fragmentation.
 * Transformers/vLLM tax. Scales slightly with VRAM size.
 */
export function frameworkOverheadGB(vramGB: number): number {
  return Math.min(2.5, 1.0 + vramGB * 0.025);
}

/**
 * Full budget calculation.
 */
export function weightsBudget(inputs: BudgetInputs): Budget {
  const kvCache = kvCacheGB(inputs.contextTokens, inputs.batchSize, inputs.refParams);
  const framework = frameworkOverheadGB(inputs.vramGB);
  const safety = inputs.vramGB * (inputs.headroomPct / 100);
  const weightsBudget = Math.max(0, inputs.vramGB - kvCache - framework - safety);
  const budgetPct = Math.round((weightsBudget / inputs.vramGB) * 100);
  return {
    total: inputs.vramGB,
    kvCache,
    framework,
    safety,
    weightsBudget,
    budgetPct,
  };
}

/**
 * Fit classification.
 * fits:  weights fit within budget
 * tight: within 15% over budget (might work, will be slow)
 * over:  don't even try
 */
export function classifyFit(modelGB: number, budget: Budget): FitClass {
  if (modelGB <= budget.weightsBudget) return 'fits';
  if (modelGB <= budget.weightsBudget * 1.15) return 'tight';
  return 'over';
}

/**
 * Pretty-print context length.
 */
export function fmtCtx(tokens: number): string {
  if (tokens >= 1024) return Math.round(tokens / 1024) + 'K';
  return String(tokens);
}

/**
 * Pretty-print GB values. Avoids floating-point artifacts in display.
 */
export function fmtGB(n: number): string {
  if (n < 1) return n.toFixed(2);
  if (n < 10) return n.toFixed(1);
  return Math.round(n).toString();
}
