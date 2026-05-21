// src/lib/quants.ts

export interface Quant {
  id: string;
  label: string;
  bits: number;       // effective bits per weight
  family: 'fp' | 'gguf' | 'awq' | 'gptq';
  qualityNote: string;
}

export const QUANTS: Quant[] = [
  { id: 'fp16',  label: 'FP16/BF16',  bits: 16,   family: 'fp',   qualityNote: 'Reference. No quality loss.' },
  { id: 'fp8',   label: 'FP8/INT8',   bits: 8,    family: 'fp',   qualityNote: 'Near-lossless on modern GPUs.' },
  { id: 'q8',    label: 'Q8_0',       bits: 8.5,  family: 'gguf', qualityNote: 'GGUF near-lossless. Common ceiling for local.' },
  { id: 'q6k',   label: 'Q6_K',       bits: 6.56, family: 'gguf', qualityNote: 'Imperceptible loss for most tasks.' },
  { id: 'q5km',  label: 'Q5_K_M',     bits: 5.5,  family: 'gguf', qualityNote: 'Excellent quality/size tradeoff.' },
  { id: 'q4km',  label: 'Q4_K_M',     bits: 4.5,  family: 'gguf', qualityNote: 'Recommended floor for production.' },
  { id: 'q3km',  label: 'Q3_K_M',     bits: 3.44, family: 'gguf', qualityNote: 'Visible degradation. Use only when forced.' },
  { id: 'awq',   label: 'AWQ 4-bit',  bits: 4.25, family: 'awq',  qualityNote: 'GPU-optimized 4-bit. vLLM friendly.' },
  { id: 'gptq',  label: 'GPTQ 4-bit', bits: 4.25, family: 'gptq', qualityNote: 'Mature GPU 4-bit. Wide tooling support.' },
];

export function quantById(id: string): Quant | undefined {
  return QUANTS.find((q) => q.id === id);
}

/**
 * Pick the highest-bit quant whose model size fits inside the given budget (GB).
 * Falls back to Q4_K_M when no quant fits.
 */
export function bestQuantForBudget(params: number, budgetGB: number): Quant {
  const sorted = QUANTS.slice().sort((a, b) => b.bits - a.bits);
  for (const q of sorted) {
    const sizeGB = params * (q.bits / 8);
    if (sizeGB <= budgetGB) return q;
  }
  return QUANTS.find((q) => q.id === 'q4km') as Quant;
}
