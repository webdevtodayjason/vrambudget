// src/lib/glossary.ts
//
// Single-source list of glossary terms used by /glossary/page.tsx,
// the AVL view, and inline links from /the-math and other pages.

export interface GlossaryTerm {
  slug: string;
  term: string;
  /** Short one-liner; used in tooltips and the in-text inline link. */
  oneLiner: string;
  /** Full definition (multi-paragraph). */
  definition: string;
  /** Related terms by slug; rendered as "see also" chips. */
  related: string[];
  /** Optional external link to a paper / blog / spec. */
  cite?: { label: string; href: string };
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: 'vram',
    term: 'VRAM',
    oneLiner: 'Video RAM. The memory on a GPU. The hard ceiling for what a model can load.',
    definition:
      "Video Random Access Memory is the physical memory on a GPU. For local LLM inference it is the hard ceiling: the model weights, the KV cache, the framework runtime, and any safety buffer all have to fit. If they don't, the load fails or the request crashes mid-token.\n\nA card's nameplate VRAM is the upper bound, not the budget. By the time you've paid the runtime overhead (CUDA context, kernel workspaces, allocator slack) and a safety margin against fragmentation, the actual weights budget on a 24GB card is roughly 18GB.\n\nApple Silicon is different: the GPU shares unified memory with the CPU, so the entire machine RAM is potential VRAM (minus what macOS wants for itself). This is why a 128GB Mac Studio can run models that would require multi-GPU rigs on NVIDIA hardware.",
    related: ['kv-cache', 'framework-overhead', 'safety-headroom'],
  },
  {
    slug: 'parameters',
    term: 'Parameters',
    oneLiner: 'The numbers the model learned. Reported in billions (B). The first factor in VRAM ≈ params × bits ÷ 8.',
    definition:
      "Parameters are the learned values inside a neural network: weights, biases, attention matrices. A 70B model has 70 billion such numbers. Bigger generally means smarter, but the relationship is non-linear and depends heavily on architecture and training data.\n\nFor memory math, parameter count is the first multiplier. At FP16 (the unquantized reference), each parameter takes 2 bytes. A 70B model at FP16 needs 140GB just for the weights, before any other memory line item.\n\nFor MoE (Mixture of Experts) models, this gets tricky: total parameters are what you need to LOAD, but only a subset is ACTIVE per forward pass. See the MoE entry.",
    related: ['moe', 'quantization', 'context-window'],
  },
  {
    slug: 'quantization',
    term: 'Quantization',
    oneLiner: 'Storing each parameter in fewer bits. The single biggest lever for fitting a big model on small hardware.',
    definition:
      "Quantization is the trick that makes local LLMs possible on consumer hardware. Instead of storing each parameter as a 16-bit float, you store it as 8 bits, or 4 bits, or in the GGUF formats some clever per-block mixture. The model gets smaller (and faster); the quality drops slightly.\n\nThe formula `VRAM ≈ params × bits ÷ 8` is the direct payoff. At FP16, 70B = 140GB. At Q4_K_M (~4.5 effective bits per param), the same model is ~39GB — small enough to fit on a 48GB workstation card.\n\nCommon formats:\n  FP16/BF16:  16 bits.  reference, no loss.\n  FP8/INT8:    8 bits.  near-lossless on modern GPUs.\n  Q8_0:       8.5 bits. GGUF near-lossless. common ceiling for local.\n  Q6_K:       6.5 bits. imperceptible loss for most tasks.\n  Q5_K_M:     5.5 bits. excellent quality/size tradeoff.\n  Q4_K_M:     4.5 bits. recommended floor for production.\n  Q3_K_M:     3.4 bits. visible degradation; use only when forced.\n  AWQ / GPTQ: 4-bit GPU-optimized formats; common on vLLM.\n\nThe `_K_M` suffix on GGUF formats means \"K-quants, medium importance preservation\" — they apply different bit-widths to different layers based on sensitivity, getting better quality at the same average size than naive uniform quantization.",
    related: ['parameters', 'vram', 'awq', 'gguf'],
  },
  {
    slug: 'kv-cache',
    term: 'KV cache',
    oneLiner: 'Memory for past tokens. Grows with context length and concurrency. The silent VRAM killer.',
    definition:
      "Every token your model generates writes a key and a value into every attention layer. These accumulate across the sequence. At 2K context length nobody notices; at 32K with concurrency 4, the KV cache can eat more VRAM than the weights themselves.\n\nThe rough formula per request is:\n\n  kv_cache_bytes ≈ 2 × layers × heads × head_dim × context × bytes_per_element\n\nFor a 70B-class model at long context, budget roughly 1-4 GB of KV per concurrent request. The exact number depends heavily on the architecture (GQA cuts it 30-60%; MQA cuts it even more).\n\nIf a calculator doesn't ask you for context length and concurrency, throw it out. It's the second most-skipped line item after framework overhead, and it's the one that crashes long sessions in production.",
    related: ['context-window', 'concurrency', 'gqa', 'mqa', 'paged-attention'],
    cite: { label: 'Anyscale: Continuous batching enables 23x throughput', href: 'https://www.anyscale.com/blog/continuous-batching-llm-inference' },
  },
  {
    slug: 'gqa',
    term: 'GQA (Grouped Query Attention)',
    oneLiner: 'Many query heads share a smaller set of key/value heads. Cuts KV cache 30-60%.',
    definition:
      "Standard multi-head attention has K, V, and Q each with N heads. The KV cache scales with N. Grouped Query Attention groups multiple Q heads together to share a single KV pair — so KV has only N/g heads, where g is the grouping factor.\n\nResult: the KV cache shrinks by roughly the same factor. A model designed with GQA at g=8 (Llama 3, Mistral) uses 1/8th the KV memory of a vanilla MHA model at the same parameter count and context length.\n\nWhen the calculator's KV estimate looks pessimistic for a Llama 3 / Mistral / Qwen 2.5+ workload, that's why. The first-order formula doesn't know your model uses GQA. Real measurements will be lower.",
    related: ['kv-cache', 'mqa', 'parameters'],
  },
  {
    slug: 'mqa',
    term: 'MQA (Multi-Query Attention)',
    oneLiner: 'A single shared K/V pair across all Q heads. Even smaller KV; older Mistral, PaLM use it.',
    definition:
      "Multi-Query Attention is GQA's extreme form: all Q heads share ONE pair of K/V vectors. The KV cache shrinks even more, at the cost of some quality (which is why newer models stepped back to GQA with reasonable group sizes).\n\nWhere you'll see it: early Mistral models, PaLM-family work, and some inference-optimized fine-tunes. Most modern open-weight models use GQA with g=4 or g=8 as the better tradeoff.",
    related: ['gqa', 'kv-cache'],
  },
  {
    slug: 'moe',
    term: 'MoE (Mixture of Experts)',
    oneLiner: 'Sparse models with many experts; only a few activate per token. Total params for memory, active params for compute.',
    definition:
      "A Mixture of Experts model has many specialized sub-networks (\"experts\"). A small \"router\" picks which experts handle each token. Only the chosen experts compute; the rest sit idle.\n\nMemory implication: you have to LOAD all experts (full parameter count), but you only COMPUTE through a fraction per forward pass. Mixtral 8x7B has 46.7B total params but only ~12.9B active per token. DeepSeek V3 has 671B total but only 37B active.\n\nThis means:\n  - For VRAM budgeting: use TOTAL params (you need them in memory).\n  - For speed expectation: use ACTIVE params (that's what determines tok/s).\n  - For multi-GPU: experts can be sharded across devices (expert parallelism).\n\nTreating MoE like a dense model leads to badly wrong estimates in both directions.",
    related: ['parameters', 'expert-parallel'],
  },
  {
    slug: 'context-window',
    term: 'Context window',
    oneLiner: 'How many tokens the model can attend to at once. Limits conversation length and document size.',
    definition:
      "Context window (sometimes \"context length\") is the maximum number of tokens the model can process in a single forward pass. Modern models advertise 32K, 128K, or even 256K. A token is roughly 4 characters of English, so 128K ≈ 100K words.\n\nLonger context costs memory linearly via the KV cache, and quality often degrades on the tail (\"lost in the middle\" effect). Just because a model advertises 256K doesn't mean it uses all 256K well.\n\nFor calculator purposes, set this to the longest single prompt you actually plan to run, not the model's advertised max. Most workloads don't fill 32K, let alone 128K.",
    related: ['kv-cache', 'concurrency', 'parameters'],
  },
  {
    slug: 'concurrency',
    term: 'Concurrency',
    oneLiner: 'Parallel requests on one model. Each request gets its own KV cache; total memory scales linearly.',
    definition:
      "Concurrency (also \"batch size\" in inference engines) is how many requests the server handles at once on a single model instance. Each in-flight request maintains its own KV cache; doubling concurrency roughly doubles the KV memory line item.\n\nIf you're running a personal assistant at one request at a time, concurrency=1. If you're building an API for many users, concurrency=8 or 16 is typical; vLLM and oMLX can push higher with paged attention.\n\nThis is why production inference servers run SMALLER models than your local desktop setup: they need the headroom for batching across users.",
    related: ['kv-cache', 'paged-attention', 'continuous-batching'],
  },
  {
    slug: 'framework-overhead',
    term: 'Framework overhead',
    oneLiner: 'CUDA context, kernel workspaces, allocator slack. 1.5-2.5 GB you cannot get back.',
    definition:
      "Before the model even loads, the runtime claims memory: CUDA context, paged-attention metadata buffers, kernel workspaces, allocator slack. None of this shows up in the model card; all of it is real.\n\nRule of thumb: 1.5GB fixed + 2-4% of total device VRAM, depending on runtime. vLLM, llama.cpp, TGI, and exllamav2 each have their own constants. The calculator caps it at 2.5 GB which is a generous middle.\n\nThis is the line item that catches people off guard the most: \"I have 24GB of VRAM, but loading a 22GB model fails.\" Right. The framework already took 1.6GB.",
    related: ['vram', 'safety-headroom'],
  },
  {
    slug: 'safety-headroom',
    term: 'Safety headroom',
    oneLiner: 'The fraction of VRAM you refuse to spend. Buffers fragmentation, spikes, and surprises.',
    definition:
      "Memory allocators don't give you the full nameplate VRAM in practice. Long sessions fragment the heap. Context shifts allocate scratch. Drivers reserve a slice. If you spend right up to the edge, you'll get OOM crashes at token 4000 instead of when the model loads.\n\nSafety headroom is the percentage you refuse to spend. 15% is a sane default. Lower if you trust your workload and need every byte; higher if you're running long agentic sessions where memory pressure builds.\n\nIn the calculator: this is the slider with 5-40% range. Default 15%.",
    related: ['vram', 'framework-overhead'],
  },
  {
    slug: 'paged-attention',
    term: 'PagedAttention',
    oneLiner: 'Block-based KV cache management. vLLM\'s trick for reducing wasted memory under high concurrency.',
    definition:
      "Standard inference allocates a fixed-size KV cache per request: enough room for the max possible context, whether you use it or not. With many concurrent requests, this leaves a lot of memory unused.\n\nPagedAttention (introduced by vLLM) borrows from operating system virtual memory: split the KV cache into fixed-size blocks, allocate them on demand, share blocks across requests with the same prefix. Result: same hardware serves significantly more concurrent users.\n\nIt's also the foundation for prefix caching (same system prompt across many requests = same blocks reused) and copy-on-write KV sharing.",
    related: ['kv-cache', 'continuous-batching', 'concurrency'],
    cite: { label: 'vLLM: PagedAttention paper (SOSP 2023)', href: 'https://arxiv.org/abs/2309.06180' },
  },
  {
    slug: 'continuous-batching',
    term: 'Continuous batching',
    oneLiner: 'New requests join the running batch immediately instead of waiting for it to finish. Up to 23x throughput.',
    definition:
      "Naive batching: collect N requests, run them as a batch, return responses, repeat. Problem: short requests finish early and the GPU sits idle waiting for the longest one.\n\nContinuous batching: as soon as one request finishes, a new one joins the in-flight batch in its slot. The GPU stays saturated. Anyscale's vLLM benchmarks showed 23x throughput improvement vs static batching on representative workloads.\n\nMost production-grade runtimes implement this: vLLM, oMLX, TGI. Ollama and LM Studio in single-user mode don't need it.",
    related: ['paged-attention', 'concurrency'],
  },
  {
    slug: 'speculative-decoding',
    term: 'Speculative decoding',
    oneLiner: 'A small draft model proposes tokens; the big model verifies in parallel. Faster decoding, same output.',
    definition:
      "Generating one token at a time is slow because each decode step is a full forward pass through the big model. Speculative decoding speeds this up: a small \"draft\" model (or a simple heuristic) proposes K tokens cheaply, then the big model verifies them in one parallel pass. If the draft was right, you saved K-1 forward passes. If it was wrong somewhere, you fall back to the standard path.\n\nVariants: n-gram (draft from common n-grams), suffix (use the actual recent tokens), EAGLE (learned draft model), DFlash. vLLM and oMLX support multiple variants.\n\nNet effect: 2-3x decode speed on typical workloads, no quality change because the big model's output distribution is preserved.",
    related: ['continuous-batching'],
  },
  {
    slug: 'tensor-parallel',
    term: 'Tensor parallelism',
    oneLiner: "Split each layer's matrix multiplication across multiple GPUs. Standard way to run models bigger than one card.",
    definition:
      "Models that don't fit on a single GPU can be split across multiple cards. Tensor parallelism splits each layer's matrices horizontally: GPU 0 computes the first half of every matrix multiply, GPU 1 the second half. After each layer, the GPUs exchange a slice of activations.\n\nThis requires high-bandwidth GPU interconnect (NVLink, Infiniband) to avoid being bottlenecked by the cross-GPU communication. With 2x H100 NVL or 8x A100 in NVLink, 405B-class models become tractable.\n\nThe alternative is pipeline parallelism (split the layers themselves across GPUs, requests flow through in sequence). Pipeline parallelism has lower bandwidth needs but introduces latency. Most production setups combine both.",
    related: ['pipeline-parallel', 'expert-parallel'],
  },
  {
    slug: 'pipeline-parallel',
    term: 'Pipeline parallelism',
    oneLiner: 'Split layers across GPUs; requests flow through like an assembly line.',
    definition:
      "Pipeline parallelism splits the model VERTICALLY: GPU 0 holds layers 1-20, GPU 1 holds layers 21-40, and so on. A request flows through them in sequence. Lower interconnect bandwidth needs than tensor parallelism, at the cost of pipeline bubbles (GPUs sit idle until the pipeline fills).\n\nProduction setups often combine pipeline parallelism (across nodes) with tensor parallelism (within a node) for the best of both. For inference at home, this rarely matters; you'll use tensor parallelism if anything.",
    related: ['tensor-parallel', 'expert-parallel'],
  },
  {
    slug: 'expert-parallel',
    term: 'Expert parallelism',
    oneLiner: 'For MoE models: shard experts across GPUs. Each GPU holds a subset; routing decides where each token goes.',
    definition:
      "MoE models have many experts. Expert parallelism puts different experts on different GPUs. The routing layer decides which experts each token needs and dispatches accordingly.\n\nGreat in theory, painful in practice: tokens are routed dynamically per layer, so the inter-GPU traffic depends on actual content. Real implementations use sophisticated batching to keep utilization reasonable.\n\nWhere it matters: serving Mixtral 8x22B, DeepSeek V3, or 671B-class MoE models across multi-GPU rigs.",
    related: ['moe', 'tensor-parallel'],
  },
  {
    slug: 'activations',
    term: 'Activations',
    oneLiner: 'The transient values inside the forward pass. Counted separately from weights and KV cache.',
    definition:
      "When the model runs a forward pass, each layer produces intermediate values (activations) that the next layer consumes. With careful implementations (Flash Attention, gradient checkpointing) the peak activation memory is small relative to weights and KV cache.\n\nFor inference, you rarely need to track activations explicitly — they're absorbed into framework overhead. For training and fine-tuning, activations dominate, which is why training a model needs 10-20x the VRAM of just inferring with it.",
    related: ['flash-attention', 'framework-overhead'],
  },
  {
    slug: 'flash-attention',
    term: 'Flash Attention',
    oneLiner: 'A faster, more memory-efficient attention kernel. Standard in every modern runtime.',
    definition:
      "Standard attention materializes the full N×N attention matrix in memory; for long sequences this is wasteful. Flash Attention fuses the matrix multiplications and softmax into a single tiled GPU kernel that streams through the sequence without materializing the full matrix. Same math, dramatically less memory pressure, often faster too.\n\nFlash Attention 2 and 3 add further optimizations (better tiling, lower precision intermediates). By now it's the assumed default in every serious runtime; if your inference engine doesn't use it, long context will OOM where it shouldn't.",
    related: ['activations', 'kv-cache'],
  },
  {
    slug: 'tokens-per-second',
    term: 'Tokens/sec (TPS)',
    oneLiner: 'How fast the model generates output. Bandwidth-bound for big models, compute-bound for small.',
    definition:
      "Tokens per second is the standard speed metric. For decode (generating one token at a time), the bottleneck is usually memory bandwidth: each token requires reading the full model weights from VRAM. So:\n\n  decode_tps ≈ memory_bandwidth ÷ model_size_in_memory\n\nA 70B model at FP16 is 140GB; on an H100 with 3.35 TB/s bandwidth, the theoretical ceiling is roughly 24 tokens/sec. Real performance is 60-80% of that.\n\nFor prompt processing (prefill), the bottleneck shifts to compute (TFLOPS). This is why \"prompt tokens/sec\" and \"output tokens/sec\" are often reported separately.",
    related: ['ttft', 'kv-cache'],
  },
  {
    slug: 'ttft',
    term: 'TTFT (Time To First Token)',
    oneLiner: 'How long from request to first generated token. Dominated by prefill on long prompts.',
    definition:
      "Time To First Token is what users feel. It's the latency from \"submit the prompt\" to \"see the first word appear.\" For a short prompt, it's fast (sub-second). For a 32K-token prompt, it can be 5-30 seconds depending on hardware and runtime — because the model has to process the entire prompt before generating anything.\n\nPaged caches (vLLM, oMLX) help here: if the prefix was seen before, those blocks are restored from cache instead of recomputed. oMLX's paged SSD cache extends this across server restarts, getting TTFT down to under 5 seconds even on long prompts that would otherwise take 90+ seconds.",
    related: ['tokens-per-second', 'paged-attention', 'kv-cache'],
  },
  {
    slug: 'awq',
    term: 'AWQ / GPTQ',
    oneLiner: 'GPU-optimized 4-bit quantization formats. AWQ for activation-aware; GPTQ for one-shot post-training.',
    definition:
      "AWQ (Activation-aware Weight Quantization) and GPTQ are both 4-bit quantization methods designed for GPU inference. They differ in how they decide which weights to quantize more aggressively:\n\n  AWQ:  protects weights that have high activation magnitudes during a calibration pass. Better quality at the same bit count.\n  GPTQ: one-shot post-training quantization using error correction. Faster to produce; widely supported.\n\nBoth are common on vLLM, exllamav2, and TGI. Quality at 4 bits is close to FP16 for most models; the trade-off vs Q4_K_M GGUF is roughly: AWQ/GPTQ are faster on GPU; GGUF is better on CPU and Apple Silicon.",
    related: ['quantization', 'gguf'],
  },
  {
    slug: 'gguf',
    term: 'GGUF',
    oneLiner: 'The model file format llama.cpp ecosystem uses. Carries the model + tokenizer + metadata in one file.',
    definition:
      "GGUF (GPT-Generated Unified Format) is the binary format used by llama.cpp and the runtimes built on it: Ollama, LM Studio, KoboldCpp. It packages model weights, tokenizer, and metadata into a single file, with first-class support for the GGUF K-quant family (Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0).\n\nGGUF replaced the older GGML format around 2023. The format is open, well-documented, and supported across CPU, CUDA, ROCm, Metal, and Vulkan backends.\n\nIf you're running on a Mac, Linux box without an NVIDIA card, or just want the easiest local setup, GGUF + llama.cpp (via Ollama or LM Studio) is the path.",
    related: ['quantization', 'awq'],
  },
];

export function termBySlug(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}
