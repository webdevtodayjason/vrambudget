// src/lib/runtimes.ts
//
// LLM inference runtimes for self-hosting. Each entry has enough detail
// to drive a /runtime/<slug>/ deep page plus the /runtime/ index card.

export type RuntimeFamily =
  | 'cross-platform'
  | 'apple-silicon'
  | 'server';

export type RuntimeType = 'cli' | 'gui' | 'server' | 'framework';

export interface RuntimeFeature {
  label: string;
  description: string;
}

export interface Runtime {
  slug: string;
  name: string;
  family: RuntimeFamily;
  type: RuntimeType;
  oneLiner: string;
  summary: string;
  platforms: string[];
  primaryPlatform: string;
  modelFormats: string[];
  apiCompat: string[];
  installCommand: string;
  installSecondary?: string;
  homepageUrl: string;
  githubUrl: string;
  docsUrl: string;
  license: string;
  bestFor: string[];
  caveats: string[];
  features: RuntimeFeature[];
  badge: string;
}

export const RUNTIME_FAMILIES: {
  id: RuntimeFamily;
  label: string;
  sub: string;
}[] = [
  {
    id: 'cross-platform',
    label: 'Cross-platform',
    sub: 'macOS · Linux · Windows',
  },
  {
    id: 'apple-silicon',
    label: 'Apple Silicon',
    sub: 'macOS · M-series',
  },
  {
    id: 'server',
    label: 'Server',
    sub: 'CUDA · ROCm · production',
  },
];

export const RUNTIMES: Runtime[] = [
  {
    slug: 'ollama',
    name: 'Ollama',
    family: 'cross-platform',
    type: 'cli',
    oneLiner: 'The easiest way to run open models locally.',
    summary:
      'Single-binary CLI with a built-in model registry. Curl-install, run a model in one command, hit it via REST on port 11434. Backed by llama.cpp under the hood; supports GGUF and safetensors. The default starting point for almost everyone running local LLMs.',
    platforms: ['macOS', 'Linux', 'Windows', 'Docker'],
    primaryPlatform: 'macOS · Linux · Windows · Docker',
    modelFormats: ['GGUF', 'safetensors'],
    apiCompat: ['REST :11434', 'OpenAI-compatible adapters'],
    installCommand: 'curl -fsSL https://ollama.com/install.sh | sh',
    installSecondary: 'irm https://ollama.com/install.ps1 | iex',
    homepageUrl: 'https://ollama.com',
    githubUrl: 'https://github.com/ollama/ollama',
    docsUrl: 'https://github.com/ollama/ollama/blob/main/docs/README.md',
    license: 'MIT',
    bestFor: [
      'First-time local LLM users',
      'Quick model swapping via `ollama run <name>`',
      'Cross-platform setups (same workflow on Mac, Linux, Windows)',
      'Integrations: Claude Code, OpenClaw, Codex, Copilot CLI all read Ollama on :11434',
    ],
    caveats: [
      'Single-tier in-memory KV cache; mid-session context shifts cause recomputation',
      'No paged attention; throughput trails vLLM under heavy concurrency',
      'GUI is minimal; pair with Open WebUI or one of the community clients for chat',
    ],
    features: [
      {
        label: 'Model registry',
        description:
          'Pull from ollama.com/library by tag (e.g. `llama3.1:8b`, `qwen2.5:32b`). One command, one model, no manual download dance.',
      },
      {
        label: 'REST + SDKs',
        description:
          'Default REST API on :11434. Official Python + JS SDKs (`pip install ollama`, `npm i ollama`).',
      },
      {
        label: 'Integrations',
        description:
          '`ollama launch <integration>` for Claude Code, Codex, Copilot CLI, OpenCode, OpenClaw, and more.',
      },
      {
        label: 'GGUF + safetensors',
        description:
          'llama.cpp backend reads quantized GGUF and full-precision safetensors. Quants from Q4_K_M up to FP16.',
      },
    ],
    badge: 'cross-platform · cli',
  },
  {
    slug: 'lm-studio',
    name: 'LM Studio',
    family: 'cross-platform',
    type: 'gui',
    oneLiner: 'Run AI models locally and privately. Full GUI plus headless `llmster` for servers.',
    summary:
      'Desktop app for browsing, downloading, and chatting with local LLMs. Supports GGUF and MLX formats. Now ships `llmster`, a no-GUI deployment binary for Linux boxes, cloud servers, and CI. Free for home and work use. Strong onboarding for users new to local inference; popular on Apple Silicon thanks to MLX support.',
    platforms: ['macOS', 'Linux', 'Windows'],
    primaryPlatform: 'macOS · Linux · Windows',
    modelFormats: ['GGUF', 'MLX'],
    apiCompat: ['OpenAI-compatible', 'JS SDK', 'Python SDK'],
    installCommand: 'curl -fsSL https://lmstudio.ai/install.sh | bash',
    installSecondary: 'Or download the GUI app from lmstudio.ai (Mac / Win / Linux)',
    homepageUrl: 'https://lmstudio.ai',
    githubUrl: 'https://github.com/lmstudio-ai',
    docsUrl: 'https://lmstudio.ai/docs',
    license: 'Proprietary (free for home and work use)',
    bestFor: [
      'Users who want a GUI for browsing and trying models',
      'Apple Silicon (first-class MLX support alongside GGUF)',
      'Quick experimentation: download, load, chat in three clicks',
      'Headless deployment via `llmster` on servers and CI',
    ],
    caveats: [
      'Not open source (proprietary license, free use only)',
      'In-memory KV cache; long agentic sessions can churn',
      'No native tool-calling parity with the agent-focused servers (oMLX, vLLM)',
    ],
    features: [
      {
        label: 'GUI app',
        description:
          'Polished desktop client for Mac (Apple Silicon), Windows, Linux. Model browser, download manager, chat UI, parameter tuning.',
      },
      {
        label: 'llmster headless',
        description:
          'Same engine without the GUI. Curl-install on Mac/Linux; PowerShell installer on Windows. Deploy on cloud servers or in CI.',
      },
      {
        label: 'LM Link',
        description:
          'Connect to remote LM Studio instances and use their loaded models as if they were local.',
      },
      {
        label: 'SDKs',
        description:
          'Official Python (`pip install lmstudio`) and JS (`npm install @lmstudio/sdk`) clients. OpenAI-compatible API surface.',
      },
    ],
    badge: 'cross-platform · gui',
  },
  {
    slug: 'vllm',
    name: 'vLLM',
    family: 'server',
    type: 'server',
    oneLiner: 'Production-grade LLM serving. PagedAttention, continuous batching, OpenAI-compatible API.',
    summary:
      'High-throughput inference engine from UC Berkeley Sky Lab, now driven by 2000+ contributors. PagedAttention manages KV memory in blocks for efficient sharing and reuse. Supports 200+ HuggingFace model architectures across NVIDIA, AMD, Intel Gaudi, TPUs, Apple Silicon, and CPU. The default choice when you need to serve many requests concurrently and the answer to "what powers production AI infra."',
    platforms: ['NVIDIA GPUs', 'AMD GPUs', 'Apple Silicon', 'Intel Gaudi', 'Google TPUs', 'x86/ARM/PowerPC CPUs'],
    primaryPlatform: 'NVIDIA CUDA (server)',
    modelFormats: ['safetensors', 'GGUF', 'AWQ', 'GPTQ', 'FP8', 'compressed-tensors'],
    apiCompat: ['OpenAI', 'Anthropic Messages', 'gRPC'],
    installCommand: 'pip install vllm',
    installSecondary: 'docker pull vllm/vllm-openai',
    homepageUrl: 'https://docs.vllm.ai/en/latest/',
    githubUrl: 'https://github.com/vllm-project/vllm',
    docsUrl: 'https://docs.vllm.ai/en/latest/',
    license: 'Apache 2.0',
    bestFor: [
      'Production inference at scale (multiple concurrent users)',
      'Distributed inference: tensor / pipeline / data / expert / context parallelism',
      'OpenAI-compatible drop-in for replacing GPT calls with self-hosted',
      'Anything serving thousands of requests per minute',
    ],
    caveats: [
      'Not a single-binary CLI; setup is heavier than Ollama or LM Studio',
      'Mostly CUDA-first; non-NVIDIA backends still maturing in spots',
      'Overkill for single-user local desktop usage',
    ],
    features: [
      {
        label: 'PagedAttention',
        description:
          'Block-based KV cache management for efficient memory sharing. Cuts wasted VRAM under high concurrency.',
      },
      {
        label: 'Continuous batching',
        description:
          'Incoming requests join the running batch immediately. Up to 23x throughput vs naive serving (Anyscale benchmarks).',
      },
      {
        label: '200+ models',
        description:
          'Llama, Qwen, Gemma, Mixtral, DeepSeek, GPT-OSS, Pixtral, Qwen-VL, E5-Mistral, ColBERT, more.',
      },
      {
        label: 'Multi-hardware',
        description:
          'NVIDIA, AMD, Intel Gaudi, Google TPUs, Apple Silicon, IBM Spyre, Huawei Ascend, Rebellions NPU.',
      },
      {
        label: 'Speculative decoding',
        description:
          'n-gram, suffix, EAGLE, DFlash. Lower latency without sacrificing quality.',
      },
      {
        label: 'Multi-LoRA',
        description:
          'Serve multiple LoRA adapters concurrently against one base model. Critical for personalized inference at scale.',
      },
    ],
    badge: 'server · production',
  },
  {
    slug: 'mlx',
    name: 'MLX',
    family: 'apple-silicon',
    type: 'framework',
    oneLiner: 'Apple\'s array framework for Apple Silicon. The substrate beneath oMLX and LM Studio MLX.',
    summary:
      'Apple\'s machine learning research framework, designed for Apple Silicon\'s unified memory architecture. NumPy-style Python API; full C++, C, and Swift bindings. Lazy evaluation, dynamic graphs, composable function transformations. Not a serving runtime on its own; you reach for `mlx-lm` (LLMs) or `mlx-vlm` (vision-language) or build on top with oMLX. Apache 2.0, actively developed by Apple ML Research.',
    platforms: ['macOS (Apple Silicon)', 'Linux (CUDA)', 'Linux (CPU)'],
    primaryPlatform: 'macOS · Apple Silicon',
    modelFormats: ['MLX'],
    apiCompat: ['Python (mlx-lm, mlx-vlm)', 'Swift', 'C++', 'C'],
    installCommand: 'pip install mlx',
    installSecondary: 'pip install mlx[cuda]   # Linux NVIDIA backend',
    homepageUrl: 'https://github.com/ml-explore/mlx',
    githubUrl: 'https://github.com/ml-explore/mlx',
    docsUrl: 'https://ml-explore.github.io/mlx/build/html/index.html',
    license: 'MIT',
    bestFor: [
      'Apple Silicon inference (the unified-memory advantage)',
      'Researchers extending the framework with custom ops',
      'Building higher-level tools (oMLX is built on this)',
      'Training and fine-tuning on Apple Silicon (LoRA on a MacBook)',
    ],
    caveats: [
      'Not a server. You wrap it in mlx-lm, oMLX, or your own code',
      'Apple Silicon native; Linux paths exist but are not the primary target',
      'The model zoo lives at huggingface.co/mlx-community (community-maintained)',
    ],
    features: [
      {
        label: 'Unified memory',
        description:
          'Arrays live in shared memory; ops run on CPU or GPU without copying data. Native fit for Apple Silicon\'s memory architecture.',
      },
      {
        label: 'Familiar APIs',
        description:
          'NumPy-style Python. PyTorch-style `mlx.nn` and `mlx.optimizers` for building models. Cross-language: Swift, C++, C.',
      },
      {
        label: 'Lazy + dynamic',
        description:
          'Computations materialize only when needed. Dynamic graph construction; no slow recompiles on shape changes.',
      },
      {
        label: 'mlx-lm + mlx-vlm',
        description:
          'Official LLM and vision-language model packages. Where you actually serve text and multimodal models from Python.',
      },
      {
        label: 'Function transforms',
        description:
          'Automatic differentiation, vectorization, computation graph optimization. Composable, JAX-style.',
      },
    ],
    badge: 'apple · framework',
  },
  {
    slug: 'omlx',
    name: 'oMLX',
    family: 'apple-silicon',
    type: 'server',
    oneLiner: 'MLX inference server for Apple Silicon. Paged SSD KV cache, menu-bar app, OpenAI + Anthropic API.',
    summary:
      'Native macOS inference server built on MLX. Solves the biggest pain in agentic local inference: when the KV cache invalidates mid-session (which it does constantly with coding agents), oMLX restores cached prefix blocks from SSD in milliseconds instead of recomputing from scratch. TTFT from 30-90s down to under 5s on the second turn. Drop-in for Claude Code, OpenClaw, Cursor. Native menu-bar app, not Electron. Apache 2.0.',
    platforms: ['macOS 15+ (Apple Silicon)'],
    primaryPlatform: 'macOS Sequoia · M1 / M2 / M3 / M4 / M5',
    modelFormats: ['MLX'],
    apiCompat: ['OpenAI /v1/chat/completions', 'Anthropic /v1/messages', 'Embeddings', 'Rerank'],
    installCommand: 'brew tap jundot/omlx https://github.com/jundot/omlx && brew install omlx',
    installSecondary: 'Or download the signed .dmg from omlx.ai (menu-bar app)',
    homepageUrl: 'https://omlx.ai',
    githubUrl: 'https://github.com/jundot/omlx',
    docsUrl: 'https://github.com/jundot/omlx#readme',
    license: 'Apache 2.0',
    bestFor: [
      'Agentic coding on a Mac: Claude Code, OpenClaw, Cursor with sub-5s TTFT after the first turn',
      'Anyone with a Mac running long agent sessions where context shifts often',
      'Multi-model serving (LLM + VLM + embedding + reranker simultaneously)',
      'Drop-in replacement for cloud APIs while staying private',
    ],
    caveats: [
      'macOS Sequoia (15+) and Apple Silicon only; no Linux or Intel Mac path',
      'MLX-format models only; bring your own from huggingface.co/mlx-community',
      'Reuses LM Studio model directories if you already have them, but does NOT auto-import from llama.cpp / GGUF',
    ],
    features: [
      {
        label: 'Paged SSD KV cache',
        description:
          'Two-tier cache: hot blocks in RAM, cold blocks on SSD in safetensors. Prefixes survive cache eviction AND server restarts. Recomputed from scratch only when truly novel.',
      },
      {
        label: 'Continuous batching',
        description:
          'mlx-lm BatchGenerator under the hood. M3 Ultra 512GB hits 190 tok/s at 8x concurrency (3.36x speedup over single-request).',
      },
      {
        label: 'OpenAI + Anthropic API',
        description:
          'Both surfaces native. Web dashboard generates the exact config command for Claude Code, OpenClaw, Cursor, Codex, Hermes, Copilot.',
      },
      {
        label: 'Multi-model serving',
        description:
          'LLMs, VLMs, embeddings, rerankers loaded simultaneously. LRU eviction + per-model TTL + manual pin/unload from the admin panel.',
      },
      {
        label: 'Tool calling + MCP',
        description:
          'JSON / Qwen / Gemma / GLM / MiniMax tool formats auto-detected. Native MCP integration. Tool-result trimming for oversized outputs.',
      },
      {
        label: 'Native menu-bar app',
        description:
          'PyObjC menu-bar app (not Electron). Signed, notarized, in-app auto-update. Persistent serving stats across restarts.',
      },
    ],
    badge: 'apple · agentic',
  },
];

export function runtimeBySlug(slug: string): Runtime | undefined {
  return RUNTIMES.find((r) => r.slug === slug);
}

export function runtimesByFamily(family: RuntimeFamily): Runtime[] {
  return RUNTIMES.filter((r) => r.family === family);
}

export function otherRuntimes(slug: string, n: number = 4): Runtime[] {
  return RUNTIMES.filter((r) => r.slug !== slug).slice(0, n);
}
