// src/app/_views/scenarios-and-extras.ts
//
// AVL view registrations for /compare/[a]/[b], /can-i-run/[slug],
// /best-gpu-for/[slug], /learn. One file for the entire trailing batch of
// secondary routes so the index in agent-views.ts stays short.

import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GPUS } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { POPULAR_COMPARISONS, canonicalPair } from '@/lib/compare';

let registered = false;

export function registerScenariosAndExtras(): void {
  if (registered) return;
  registered = true;

  // Per-comparison pair.
  for (const { a, b } of POPULAR_COMPARISONS) {
    const c = canonicalPair(a, b);
    const pattern = `/compare/${c.a}/${c.b}`;
    const gpuA = GPUS.find((g) => g.slug === c.a);
    const gpuB = GPUS.find((g) => g.slug === c.b);
    if (!gpuA || !gpuB) continue;

    const view = defineAgentView({
      intent: {
        purpose: `Head-to-head comparison of ${gpuA.name} vs ${gpuB.name} for local LLM inference.`,
        audience: ['hardware-shopper', 'ai-engineer', 'self-hoster'],
        capability: ['compare_specs', 'compare_model_fits', 'drill_into_card'],
      },
      state: () => ({
        a: { slug: gpuA.slug, name: gpuA.name, vram_gb: gpuA.vramGB, bandwidth_gbs: gpuA.bandwidthGBs, fp16_tflops: gpuA.fp16Tflops, budget_8k_gb: gpuA.budget8kGB },
        b: { slug: gpuB.slug, name: gpuB.name, vram_gb: gpuB.vramGB, bandwidth_gbs: gpuB.bandwidthGBs, fp16_tflops: gpuB.fp16Tflops, budget_8k_gb: gpuB.budget8kGB },
      }),
      actions: [
        { id: 'view_a', method: 'GET', href: `/gpu/${gpuA.slug}` },
        { id: 'view_b', method: 'GET', href: `/gpu/${gpuB.slug}` },
      ],
      context: () =>
        `Side-by-side comparison: ${gpuA.name} (${gpuA.vramGB}GB) vs ${gpuB.name} (${gpuB.vramGB}GB). Includes specs delta and fit difference across the 30-model catalog.`,
      nav: () => ({
        self: pattern,
        parents: ['/', '/gpu/'],
        peers: [`/gpu/${gpuA.slug}`, `/gpu/${gpuB.slug}`],
      }),
    });
    registerAgentRoute(pattern, view);
  }

  // Per-model scenario pages.
  for (const m of MODELS) {
    const canIRun = defineAgentView({
      intent: {
        purpose: `Hardware requirements to run ${m.name} locally.`,
        audience: ['hardware-shopper', 'ai-engineer', 'self-hoster'],
        capability: ['check_compatibility', 'find_cheapest_fit', 'find_best_quality'],
      },
      state: () => ({
        slug: m.slug,
        name: m.name,
        params_b: m.params,
        fp16_gb: m.fp16GB,
        type: m.type,
      }),
      actions: [
        { id: 'view_model', method: 'GET', href: `/model/${m.slug}` },
        { id: 'view_ranked_gpus', method: 'GET', href: `/best-gpu-for/${m.slug}` },
        { id: 'tune_calculator', method: 'GET', href: `/calc?model=${m.slug}` },
      ],
      context: () => `What hardware actually fits ${m.name} (${m.params}B params) across FP16 / Q8_0 / Q5_K_M / Q4_K_M / Q3_K_M quants. Includes the cheapest fit, the best-quality fit, and the Apple Silicon recommendation.`,
      nav: () => ({
        self: `/can-i-run/${m.slug}`,
        parents: ['/', '/model/'],
        peers: [`/best-gpu-for/${m.slug}`, `/model/${m.slug}`],
        drilldown: `/calc?model=${m.slug}`,
      }),
    });
    registerAgentRoute(`/can-i-run/${m.slug}`, canIRun);

    const bestFor = defineAgentView({
      intent: {
        purpose: `Ranked GPU recommendations for running ${m.name}.`,
        audience: ['hardware-shopper', 'ai-engineer', 'self-hoster'],
        capability: ['rank_gpus', 'pick_cheapest', 'pick_best_quality', 'pick_apple'],
      },
      state: () => ({
        slug: m.slug,
        name: m.name,
        params_b: m.params,
      }),
      actions: [
        { id: 'view_model', method: 'GET', href: `/model/${m.slug}` },
        { id: 'view_can_i_run', method: 'GET', href: `/can-i-run/${m.slug}` },
        { id: 'tune_calculator', method: 'GET', href: `/calc?model=${m.slug}` },
      ],
      context: () => `GPU ranking for ${m.name}: top picks across tightest-budget, best-quality, Apple Silicon, and datacenter categories. Full ordered list with weights, best quant, and fit class per card.`,
      nav: () => ({
        self: `/best-gpu-for/${m.slug}`,
        parents: ['/', '/gpu/'],
        peers: [`/can-i-run/${m.slug}`, `/model/${m.slug}`],
      }),
    });
    registerAgentRoute(`/best-gpu-for/${m.slug}`, bestFor);
  }

  // /learn — guided tour.
  const learn = defineAgentView({
    intent: {
      purpose: 'Six-chapter guided tour from zero to first locally-running LLM. Targets newcomers.',
      audience: ['ai-newcomer', 'student', 'self-hoster'],
      capability: ['progressive_learn', 'follow_to_calculator', 'pick_first_runtime', 'pick_first_model'],
    },
    state: () => ({
      chapters: [
        { num: '01', anchor: 'parameters', title: 'Parameters' },
        { num: '02', anchor: 'bits', title: 'Bits' },
        { num: '03', anchor: 'kv-cache', title: 'KV cache' },
        { num: '04', anchor: 'hardware', title: 'Picking hardware' },
        { num: '05', anchor: 'runtime', title: 'Picking a runtime' },
        { num: '06', anchor: 'together', title: 'Putting it together' },
      ],
      estimated_read_min: 12,
    }),
    actions: [
      { id: 'start_chapter_1', method: 'GET', href: '/learn#parameters' },
      { id: 'open_calculator', method: 'GET', href: '/calc' },
      { id: 'browse_models', method: 'GET', href: '/model/' },
      { id: 'browse_runtimes', method: 'GET', href: '/runtime/' },
      { id: 'browse_glossary', method: 'GET', href: '/glossary' },
    ],
    context: () =>
      'A first-time-reader curriculum: chapter 01 parameters, 02 bits/quantization, 03 KV cache, 04 picking hardware, 05 picking a runtime, 06 putting it together. Funnels into the calculator + a 5-step recipe for running your first model.',
    nav: () => ({
      self: '/learn',
      parents: ['/'],
      peers: ['/the-math', '/glossary'],
      drilldown: '/calc',
    }),
  });
  registerAgentRoute('/learn', learn);
}
