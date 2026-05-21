// src/lib/fit-math.ts
//
// Render the actual VRAM math behind a model/GPU fit decision as an explainer
// string. Used by the "show the math" expanders on /gpu/<slug> and
// /model/<slug> detail pages.

import type { GPU } from './gpus';
import type { Model } from './models';
import type { Quant } from './quants';
import {
  modelSizeGB,
  kvCacheGB,
  frameworkOverheadGB,
  weightsBudget,
  classifyFit,
} from './vram';

export interface FitMathArgs {
  gpu: GPU;
  model: Model;
  quant: Quant;
  context?: number;
  concurrency?: number;
  safetyPct?: number;
}

/**
 * Returns a multi-line monospace explainer of how a (gpu, model, quant) tuple
 * resolves to a fit class. Lines are formatted to be readable inside a
 * mono-styled preformatted block.
 */
export function explainFit({
  gpu,
  model,
  quant,
  context = 8192,
  concurrency = 1,
  safetyPct = 15,
}: FitMathArgs): string {
  const weight = modelSizeGB(model.params, quant.bits);
  const kv = kvCacheGB(context, concurrency);
  const overhead = frameworkOverheadGB(gpu.vramGB);
  const safety = gpu.vramGB * (safetyPct / 100);
  const budget = weightsBudget({
    vramGB: gpu.vramGB,
    contextTokens: context,
    batchSize: concurrency,
    headroomPct: safetyPct,
  });
  const fit = classifyFit(weight, budget);
  const remaining = budget.weightsBudget - weight;

  const ctxK = context >= 1024 ? `${(context / 1024).toFixed(0)}K` : `${context}`;

  const lines = [
    `// weights ${quant.label} for ${model.name} (${model.params}B params)`,
    `weights = params × bits ÷ 8`,
    `        = ${model.params} × ${quant.bits} ÷ 8`,
    `        = ${weight.toFixed(2)} GB`,
    ``,
    `// budget on ${gpu.name} (${gpu.vramGB}GB) at ctx ${ctxK}, conc ${concurrency}, ${safetyPct}% safety`,
    `kv_cache  = ${kv.toFixed(2)} GB    (${concurrency}× at ctx ${ctxK})`,
    `overhead  = ${overhead.toFixed(2)} GB    (runtime, cuda, allocator)`,
    `safety    = ${safety.toFixed(2)} GB    (${safetyPct}% of ${gpu.vramGB}GB)`,
    `budget    = vram − safety − kv − overhead`,
    `          = ${gpu.vramGB} − ${safety.toFixed(2)} − ${kv.toFixed(2)} − ${overhead.toFixed(2)}`,
    `          = ${budget.weightsBudget.toFixed(2)} GB`,
    ``,
    `// fit decision`,
    `${weight.toFixed(2)} ${weight <= budget.weightsBudget ? '≤' : '>'} ${budget.weightsBudget.toFixed(2)}  → ${fit.toUpperCase()}`,
    remaining >= 0
      ? `headroom  = ${remaining.toFixed(2)} GB of weights budget left`
      : `overflow  = ${Math.abs(remaining).toFixed(2)} GB over budget`,
  ];

  return lines.join('\n');
}
