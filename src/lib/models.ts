// src/lib/models.ts

export type ModelFamily =
  | 'Meta'
  | 'Alibaba'
  | 'Mistral'
  | 'Microsoft'
  | 'Google'
  | 'DeepSeek'
  | '01.AI'
  | 'Cohere'
  | 'IBM'
  | 'BigCode';

export interface Model {
  slug: string;
  name: string;
  hfRepo: string;
  params: number;        // billions, total
  activeParams?: number; // billions, for MoE
  family: ModelFamily;
  type: 'dense' | 'moe';
  contextK: number;
  fp16GB: number;
  summary: string;
}

export const MODELS: Model[] = [
  // Meta
  {
    slug: 'llama-3-1-8b',
    name: 'Llama 3.1 8B',
    hfRepo: 'meta-llama/Llama-3.1-8B-Instruct',
    params: 8.0,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 16.0,
    summary: "Meta's small workhorse. Runs comfortably on any 8GB+ card at Q4 or any 12GB+ at FP16.",
  },
  {
    slug: 'llama-3-1-70b',
    name: 'Llama 3.1 70B',
    hfRepo: 'meta-llama/Llama-3.1-70B-Instruct',
    params: 70.0,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 140.0,
    summary: "Meta's flagship open-weight. Fits comfortably on 48GB at Q5_K_M; tightly on a 24GB at Q3_K_M.",
  },
  {
    slug: 'llama-3-1-405b',
    name: 'Llama 3.1 405B',
    hfRepo: 'meta-llama/Llama-3.1-405B-Instruct',
    params: 405.0,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 810.0,
    summary: 'The big one. Q4 needs ~200GB. Single-GPU options exist (MI300X, B200) but rare.',
  },
  // Alibaba (Qwen)
  {
    slug: 'qwen-2-5-7b',
    name: 'Qwen 2.5 7B',
    hfRepo: 'Qwen/Qwen2.5-7B-Instruct',
    params: 7.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 14.0,
    summary: "Alibaba's small model. Strong multilingual. Same fit envelope as Llama 3.1 8B.",
  },
  {
    slug: 'qwen-2-5-32b',
    name: 'Qwen 2.5 32B',
    hfRepo: 'Qwen/Qwen2.5-32B-Instruct',
    params: 32.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 64.0,
    summary: '32B sweet spot. Q4 runs on a 4090; Q8 comfortable on the H100.',
  },
  {
    slug: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B',
    hfRepo: 'Qwen/Qwen2.5-72B-Instruct',
    params: 72.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 144.0,
    summary: "Llama-3.1-70B's strongest open competitor. Same hardware story.",
  },
  // Mistral
  {
    slug: 'mistral-7b',
    name: 'Mistral 7B v0.3',
    hfRepo: 'mistralai/Mistral-7B-Instruct-v0.3',
    params: 7.2,
    family: 'Mistral',
    type: 'dense',
    contextK: 32,
    fp16GB: 14.0,
    summary: 'The reference 7B. Apache-2 licensed. Runs anywhere.',
  },
  {
    slug: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    hfRepo: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    params: 46.7,
    activeParams: 12.9,
    family: 'Mistral',
    type: 'moe',
    contextK: 32,
    fp16GB: 93.0,
    summary: 'MoE — full 46.7B parameters, only ~13B active at a time. Faster than dense at the same fit.',
  },
  {
    slug: 'mixtral-8x22b',
    name: 'Mixtral 8x22B',
    hfRepo: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    params: 141.0,
    activeParams: 39,
    family: 'Mistral',
    type: 'moe',
    contextK: 64,
    fp16GB: 282.0,
    summary: 'Big MoE. Q4 fits on a 96GB workstation; Q3 on a single H100.',
  },
  // Microsoft
  {
    slug: 'phi-3-mini',
    name: 'Phi-3 Mini',
    hfRepo: 'microsoft/Phi-3-mini-128k-instruct',
    params: 3.8,
    family: 'Microsoft',
    type: 'dense',
    contextK: 128,
    fp16GB: 7.6,
    summary: 'Tiny but capable. FP16 fits on any 8GB card with room to spare.',
  },
  {
    slug: 'phi-3-medium',
    name: 'Phi-3 Medium',
    hfRepo: 'microsoft/Phi-3-medium-128k-instruct',
    params: 14.0,
    family: 'Microsoft',
    type: 'dense',
    contextK: 128,
    fp16GB: 28.0,
    summary: '14B with 128K context. Q5 on a 4060 Ti 16GB; FP16 on a 4090.',
  },
  {
    slug: 'wizardlm-2-7b',
    name: 'WizardLM 2 7B',
    hfRepo: 'microsoft/WizardLM-2-7B',
    params: 7.0,
    family: 'Microsoft',
    type: 'dense',
    contextK: 32,
    fp16GB: 14.0,
    summary: 'Fine-tune of Mistral 7B. Strong instruction-following. Same fit as Mistral 7B.',
  },
  // Google
  {
    slug: 'gemma-2-9b',
    name: 'Gemma 2 9B',
    hfRepo: 'google/gemma-2-9b-it',
    params: 9.0,
    family: 'Google',
    type: 'dense',
    contextK: 8,
    fp16GB: 18.0,
    summary: "Google's small model. Strong on logic, weak on context. FP16 fits on most cards.",
  },
  {
    slug: 'gemma-2-27b',
    name: 'Gemma 2 27B',
    hfRepo: 'google/gemma-2-27b-it',
    params: 27.0,
    family: 'Google',
    type: 'dense',
    contextK: 8,
    fp16GB: 54.0,
    summary: '27B sweet spot. Q6 on a 4090; Q8 on an A6000.',
  },
  // DeepSeek
  {
    slug: 'deepseek-coder-33b',
    name: 'DeepSeek Coder 33B',
    hfRepo: 'deepseek-ai/deepseek-coder-33b-instruct',
    params: 33.0,
    family: 'DeepSeek',
    type: 'dense',
    contextK: 16,
    fp16GB: 66.0,
    summary: 'The reference coding model. Q4 on a 4090; Q5 on an A6000.',
  },
  {
    slug: 'deepseek-v2-5',
    name: 'DeepSeek-V2.5',
    hfRepo: 'deepseek-ai/DeepSeek-V2.5',
    params: 236.0,
    activeParams: 21,
    family: 'DeepSeek',
    type: 'moe',
    contextK: 128,
    fp16GB: 472.0,
    summary: '236B MoE. Q4 fits on a 192GB card. Production answer to GPT-class models.',
  },
  // 01.AI
  {
    slug: 'yi-34b',
    name: 'Yi 34B',
    hfRepo: '01-ai/Yi-34B-Chat',
    params: 34.0,
    family: '01.AI',
    type: 'dense',
    contextK: 200,
    fp16GB: 68.0,
    summary: 'Long-context Chinese-English. Q4 on a 4090 with short context; needs more for full 200K.',
  },
  // Cohere
  {
    slug: 'command-r-plus',
    name: 'Command R+',
    hfRepo: 'CohereForAI/c4ai-command-r-plus',
    params: 104.0,
    family: 'Cohere',
    type: 'dense',
    contextK: 128,
    fp16GB: 208.0,
    summary: "Cohere's RAG-tuned flagship. Q4 fits on an H100; Q3 on a 4090 (tight).",
  },
  // IBM
  {
    slug: 'granite-8b',
    name: 'Granite 8B Code',
    hfRepo: 'ibm-granite/granite-8b-code-instruct',
    params: 8.0,
    family: 'IBM',
    type: 'dense',
    contextK: 128,
    fp16GB: 16.0,
    summary: "IBM's enterprise-licensed code model. Same fit envelope as Llama 3.1 8B.",
  },
  // BigCode
  {
    slug: 'starcoder2-15b',
    name: 'StarCoder2 15B',
    hfRepo: 'bigcode/starcoder2-15b',
    params: 15.0,
    family: 'BigCode',
    type: 'dense',
    contextK: 16,
    fp16GB: 30.0,
    summary: 'BigCode collaboration. 600 programming languages. FP16 on a 4080 or better.',
  },
];

export function modelBySlug(slug: string): Model | undefined {
  return MODELS.find((m) => m.slug === slug);
}

/**
 * Return the `n` (default 4) models closest to the given slug's params,
 * by absolute parameter distance, excluding the slug itself.
 *
 * Replaces the earlier "±tolerance percent filter" algorithm so the
 * compare panel on /model/[slug] always shows up to n alternatives even
 * for very-large or very-small parameter counts where no other model is
 * within ±30%.
 *
 * Backward-compat: existing callers pass only the slug. The optional
 * second arg used to be a tolerance percentage; it is now a count.
 */
export function similarModelsByParams(slug: string, n: number = 4): Model[] {
  const self = modelBySlug(slug);
  if (!self) return [];
  // Backward-compat: earlier signature was `(slug, tolerance: number = 0.3)`.
  // Existing call sites still pass values like 0.3. Treat any non-integer
  // sub-1 value as legacy and default to 4.
  const count = n >= 1 ? Math.floor(n) : 4;
  return MODELS
    .filter((m) => m.slug !== slug)
    .map((m) => ({ m, dist: Math.abs(m.params - self.params) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map(({ m }) => m);
}
