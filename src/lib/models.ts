// src/lib/models.ts
//
// Curated model catalog. Refreshed 2026-05-21.
// Curation strategy lives in README.md ("Keeping the catalog fresh"); the short
// version: canonical orgs only (meta-llama, Qwen, openai, google, deepseek-ai,
// mistralai, microsoft, etc.), refreshed roughly quarterly to track new
// canonical releases. Trending GGUF remixes and uncensored forks are surfaced
// live via the "Search Hugging Face" tab, not pinned here.

export type ModelFamily =
  | 'Meta'
  | 'Alibaba'
  | 'OpenAI'
  | 'Mistral'
  | 'Microsoft'
  | 'Google'
  | 'DeepSeek'
  | '01.AI'
  | 'Cohere'
  | 'IBM'
  | 'BigCode';

export interface ModelRuntimes {
  /** Ollama library tag, e.g. "llama3.3:70b". Empty/undefined means no canonical tag. */
  ollama?: string;
  /** LM Studio supports any GGUF; mark `false` only if no GGUF exists. */
  lmstudio?: boolean;
  /** vLLM supports most HF transformers safetensors models. */
  vllm?: boolean;
  /** Apple Silicon via mlx-community on Hugging Face. */
  mlx?: boolean;
  /** oMLX serves any MLX-format model. Effectively the same surface as MLX. */
  omlx?: boolean;
}

export interface Model {
  slug: string;
  name: string;
  hfRepo: string;
  params: number;        // billions, total
  activeParams?: number; // billions, for MoE (active per forward pass)
  family: ModelFamily;
  type: 'dense' | 'moe';
  contextK: number;
  fp16GB: number;
  summary: string;
  releaseQuarter?: string; // e.g. '2024-Q4' for "when did this drop"
  runtimes?: ModelRuntimes;
}

export const MODELS: Model[] = [
  // ── Meta ──────────────────────────────────────────────────────────
  {
    slug: 'llama-3-2-1b',
    name: 'Llama 3.2 1B',
    hfRepo: 'meta-llama/Llama-3.2-1B-Instruct',
    params: 1.23,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 2.46,
    summary: 'Sub-2B edge tier. Runs on phones and 8GB consumer cards. Multilingual instruct.',
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'llama3.2:1b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'llama-3-2-3b',
    name: 'Llama 3.2 3B',
    hfRepo: 'meta-llama/Llama-3.2-3B-Instruct',
    params: 3.21,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 6.42,
    summary: 'Edge-tier. Assistant-quality on a 6GB GPU. 128K context.',
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'llama3.2:3b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
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
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'llama3.1:8b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'llama-3-3-70b',
    name: 'Llama 3.3 70B',
    hfRepo: 'meta-llama/Llama-3.3-70B-Instruct',
    params: 70.6,
    family: 'Meta',
    type: 'dense',
    contextK: 128,
    fp16GB: 141.2,
    summary: "Meta's late-2024 70B. Closes the gap to GPT-4o-mini at the same VRAM footprint as 3.1 70B.",
    releaseQuarter: '2024-Q4',
    runtimes: { ollama: 'llama3.3:70b', lmstudio: true, vllm: true, mlx: true, omlx: true },
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
    summary: "The big one. 810GB at FP16 puts it in DGX or multi-GPU territory. Q3-Q4 quants fit on 2x H100 NVL or M3 Ultra 512.",
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'llama3.1:405b', lmstudio: true, vllm: true, mlx: false, omlx: false },
  },

  // ── Alibaba (Qwen) ────────────────────────────────────────────────
  {
    slug: 'qwen-2-5-7b',
    name: 'Qwen 2.5 7B',
    hfRepo: 'Qwen/Qwen2.5-7B-Instruct',
    params: 7.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 14.0,
    summary: 'Alibaba\'s 7B reference. Strong multilingual; great FP16 fit on consumer cards.',
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'qwen2.5:7b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-2-5-32b',
    name: 'Qwen 2.5 32B',
    hfRepo: 'Qwen/Qwen2.5-32B-Instruct',
    params: 32.5,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 65.0,
    summary: 'Alibaba\'s mid-range workhorse. Q4_K_M lands at ~18 GB, the canonical "fits on a 24GB" 30B-class.',
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'qwen2.5:32b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-2-5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    hfRepo: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    params: 32.5,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 65.0,
    summary: 'Code-specialized 32B. Near-GPT-4 code completion and repair at local-inference cost.',
    releaseQuarter: '2024-Q4',
    runtimes: { ollama: 'qwen2.5-coder:32b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-2-5-72b',
    name: 'Qwen 2.5 72B',
    hfRepo: 'Qwen/Qwen2.5-72B-Instruct',
    params: 72.7,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 145.4,
    summary: 'Alibaba\'s 70B-class flagship. Comparable footprint to Llama 70B; different inflections on benchmarks.',
    releaseQuarter: '2024-Q3',
    runtimes: { ollama: 'qwen2.5:72b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-3-30b-a3b',
    name: 'Qwen3 30B A3B',
    hfRepo: 'Qwen/Qwen3-30B-A3B-Instruct-2507',
    params: 30.5,
    activeParams: 3.3,
    family: 'Alibaba',
    type: 'moe',
    contextK: 256,
    fp16GB: 61.0,
    summary: 'Qwen3 MoE: 30B total, 3B active. Tokens per second of a 3B model at the quality of a 30B.',
    releaseQuarter: '2025-Q3',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-3-5-9b',
    name: 'Qwen 3.5 9B',
    hfRepo: 'Qwen/Qwen3.5-9B',
    params: 9.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 18.0,
    summary: 'Q1 2026 Qwen3.5 dense. The new sub-10B reference; vision-capable variants ship under the same family.',
    releaseQuarter: '2026-Q1',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-3-6-27b',
    name: 'Qwen 3.6 27B',
    hfRepo: 'Qwen/Qwen3.6-27B',
    params: 27.0,
    family: 'Alibaba',
    type: 'dense',
    contextK: 128,
    fp16GB: 54.0,
    summary: 'Q2 2026 Qwen3.6 dense flagship. Vision + tool calling; tops the Qwen line on most benchmarks.',
    releaseQuarter: '2026-Q2',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'qwen-3-6-35b-a3b',
    name: 'Qwen 3.6 35B A3B',
    hfRepo: 'Qwen/Qwen3.6-35B-A3B',
    params: 35.0,
    activeParams: 3.0,
    family: 'Alibaba',
    type: 'moe',
    contextK: 256,
    fp16GB: 70.0,
    summary: 'Q2 2026 Qwen3.6 MoE flagship. 35B total, 3B active. Vision + multilingual + tool calling.',
    releaseQuarter: '2026-Q2',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── OpenAI ────────────────────────────────────────────────────────
  {
    slug: 'gpt-oss-20b',
    name: 'gpt-oss 20B',
    hfRepo: 'openai/gpt-oss-20b',
    params: 20.9,
    activeParams: 3.6,
    family: 'OpenAI',
    type: 'moe',
    contextK: 128,
    fp16GB: 41.8,
    summary: "OpenAI's August 2025 open-weight release. MoE; ships MXFP4-quantized at ~13GB on consumer cards.",
    releaseQuarter: '2025-Q3',
    runtimes: { ollama: 'gpt-oss:20b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'gpt-oss-120b',
    name: 'gpt-oss 120B',
    hfRepo: 'openai/gpt-oss-120b',
    params: 117.0,
    activeParams: 5.1,
    family: 'OpenAI',
    type: 'moe',
    contextK: 128,
    fp16GB: 234.0,
    summary: "OpenAI's open-weight flagship. Near o4-mini on core reasoning; MXFP4 deployment fits a single 80GB H100.",
    releaseQuarter: '2025-Q3',
    runtimes: { ollama: 'gpt-oss:120b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── Mistral ───────────────────────────────────────────────────────
  {
    slug: 'mistral-7b',
    name: 'Mistral 7B v0.3',
    hfRepo: 'mistralai/Mistral-7B-Instruct-v0.3',
    params: 7.2,
    family: 'Mistral',
    type: 'dense',
    contextK: 32,
    fp16GB: 14.4,
    summary: 'The original 7B benchmark. Still a reliable baseline; smaller context than the newer entries.',
    releaseQuarter: '2024-Q2',
    runtimes: { ollama: 'mistral:7b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'mistral-small-3',
    name: 'Mistral Small 3',
    hfRepo: 'mistralai/Mistral-Small-24B-Instruct-2501',
    params: 24.0,
    family: 'Mistral',
    type: 'dense',
    contextK: 32,
    fp16GB: 48.0,
    summary: 'January 2025 Mistral 24B. Llama 3.3 70B-tier quality at a third of the VRAM.',
    releaseQuarter: '2025-Q1',
    runtimes: { ollama: 'mistral-small:24b', lmstudio: true, vllm: true, mlx: true, omlx: true },
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
    fp16GB: 93.4,
    summary: 'The MoE that proved sparse models work for inference. 8 experts, 2 active per token.',
    releaseQuarter: '2023-Q4',
    runtimes: { ollama: 'mixtral:8x7b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'mixtral-8x22b',
    name: 'Mixtral 8x22B',
    hfRepo: 'mistralai/Mixtral-8x22B-Instruct-v0.1',
    params: 141.0,
    activeParams: 39.0,
    family: 'Mistral',
    type: 'moe',
    contextK: 64,
    fp16GB: 282.0,
    summary: 'Big Mixtral. 141B total, 39B active. Multi-GPU or M-series Ultra territory.',
    releaseQuarter: '2024-Q2',
    runtimes: { ollama: 'mixtral:8x22b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── Microsoft ─────────────────────────────────────────────────────
  {
    slug: 'phi-4-mini',
    name: 'Phi-4 Mini',
    hfRepo: 'microsoft/Phi-4-mini-instruct',
    params: 3.8,
    family: 'Microsoft',
    type: 'dense',
    contextK: 128,
    fp16GB: 7.6,
    summary: '3.8B Phi-4 distill. Strong reasoning at edge sizes; 128K context.',
    releaseQuarter: '2025-Q1',
    runtimes: { ollama: 'phi4-mini', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'phi-4',
    name: 'Phi-4',
    hfRepo: 'microsoft/phi-4',
    params: 14.7,
    family: 'Microsoft',
    type: 'dense',
    contextK: 16,
    fp16GB: 29.4,
    summary: "Microsoft's synthetic-data 14B. Punches above its weight on math and code.",
    releaseQuarter: '2024-Q4',
    runtimes: { ollama: 'phi4', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── Google ────────────────────────────────────────────────────────
  {
    slug: 'gemma-2-9b',
    name: 'Gemma 2 9B',
    hfRepo: 'google/gemma-2-9b-it',
    params: 9.0,
    family: 'Google',
    type: 'dense',
    contextK: 8,
    fp16GB: 18.0,
    summary: 'Google\'s 2024 9B. Solid baseline; shorter context than Gemma 4.',
    releaseQuarter: '2024-Q2',
    runtimes: { ollama: 'gemma2:9b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'gemma-4-e4b',
    name: 'Gemma 4 E4B',
    hfRepo: 'google/gemma-4-E4B-it',
    params: 4.0,
    family: 'Google',
    type: 'dense',
    contextK: 128,
    fp16GB: 8.0,
    summary: "Google's April 2026 small Gemma. Multimodal-ready, 128K context.",
    releaseQuarter: '2026-Q2',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'gemma-4-26b',
    name: 'Gemma 4 26B A4B',
    hfRepo: 'google/gemma-4-26B-A4B-it',
    params: 26.0,
    activeParams: 4.0,
    family: 'Google',
    type: 'moe',
    contextK: 128,
    fp16GB: 52.0,
    summary: 'Google\'s 2026 MoE: 26B total, 4B active. Vision-ready.',
    releaseQuarter: '2026-Q2',
    runtimes: { lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── DeepSeek ──────────────────────────────────────────────────────
  {
    slug: 'deepseek-v3',
    name: 'DeepSeek V3',
    hfRepo: 'deepseek-ai/DeepSeek-V3',
    params: 671.0,
    activeParams: 37.0,
    family: 'DeepSeek',
    type: 'moe',
    contextK: 128,
    fp16GB: 1342.0,
    summary: '671B MoE, 37B active. GPT-4 class on a fraction of the inference cost. Multi-node serving at FP16.',
    releaseQuarter: '2024-Q4',
    runtimes: { ollama: 'deepseek-v3', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
  {
    slug: 'deepseek-r1',
    name: 'DeepSeek R1',
    hfRepo: 'deepseek-ai/DeepSeek-R1',
    params: 671.0,
    activeParams: 37.0,
    family: 'DeepSeek',
    type: 'moe',
    contextK: 128,
    fp16GB: 1342.0,
    summary: 'V3 plus reasoning post-training. The model that proved RL-from-scratch chain-of-thought works at scale.',
    releaseQuarter: '2025-Q1',
    runtimes: { ollama: 'deepseek-r1', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── 01.AI ─────────────────────────────────────────────────────────
  {
    slug: 'yi-34b',
    name: 'Yi 34B',
    hfRepo: '01-ai/Yi-34B-Chat',
    params: 34.0,
    family: '01.AI',
    type: 'dense',
    contextK: 32,
    fp16GB: 68.0,
    summary: '01.AI\'s 34B. Bilingual EN/ZH; long-context variants up to 200K available.',
    releaseQuarter: '2023-Q4',
    runtimes: { ollama: 'yi:34b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── Cohere ────────────────────────────────────────────────────────
  {
    slug: 'command-r-plus',
    name: 'Command R+',
    hfRepo: 'CohereForAI/c4ai-command-r-plus',
    params: 104.0,
    family: 'Cohere',
    type: 'dense',
    contextK: 128,
    fp16GB: 208.0,
    summary: 'Cohere\'s 100B-class. Strong RAG and tool-use bench results; non-commercial license.',
    releaseQuarter: '2024-Q2',
    runtimes: { ollama: 'command-r-plus', lmstudio: true, vllm: true, mlx: false, omlx: false },
  },

  // ── IBM ───────────────────────────────────────────────────────────
  {
    slug: 'granite-8b',
    name: 'Granite 8B Code',
    hfRepo: 'ibm-granite/granite-8b-code-instruct',
    params: 8.0,
    family: 'IBM',
    type: 'dense',
    contextK: 8,
    fp16GB: 16.0,
    summary: 'IBM\'s 8B code-specialist. Apache 2.0; safe enterprise default for code completion.',
    releaseQuarter: '2024-Q2',
    runtimes: { ollama: 'granite-code:8b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },

  // ── BigCode ───────────────────────────────────────────────────────
  {
    slug: 'starcoder2-15b',
    name: 'StarCoder2 15B',
    hfRepo: 'bigcode/starcoder2-15b',
    params: 15.0,
    family: 'BigCode',
    type: 'dense',
    contextK: 16,
    fp16GB: 30.0,
    summary: 'BigCode\'s 15B code reference. Strong fill-in-the-middle; the open StarCoder lineage continues here.',
    releaseQuarter: '2024-Q1',
    runtimes: { ollama: 'starcoder2:15b', lmstudio: true, vllm: true, mlx: true, omlx: true },
  },
];

export function modelBySlug(slug: string): Model | undefined {
  return MODELS.find((m) => m.slug === slug);
}

export function similarModelsByParams(
  slug: string,
  n: number = 4,
): Model[] {
  const count = n >= 1 ? Math.floor(n) : 4;
  const self = modelBySlug(slug);
  if (!self) return [];
  return MODELS
    .filter((m) => m.slug !== slug)
    .map((m) => ({ m, dist: Math.abs(m.params - self.params) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count)
    .map((x) => x.m);
}
