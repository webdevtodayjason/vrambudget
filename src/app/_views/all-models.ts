/**
 * AVL view registration module for /model/[slug] routes.
 *
 * Exports `registerAllModelViews()`. The central `src/app/agent-views.ts`
 * (S7's territory) imports + invokes this at module load so the postbuild
 * emitter walks one AGENT_ROUTES entry per model.
 *
 * Idempotent: re-calling is a no-op.
 */
import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import {
  MODELS,
  modelBySlug,
  similarModelsByParams,
} from '@/lib/models';
import { GPUS } from '@/lib/gpus';
import { QUANTS } from '@/lib/quants';
import { weightsBudget, modelSizeGB, classifyFit } from '@/lib/vram';

let registered = false;

/**
 * Returns the slug of the smallest-VRAM GPU whose 8K-context budget can
 * hold the given param count at the given bits per weight. Returns null
 * when no GPU in the catalog fits.
 */
function smallestFittingGpuSlug(params: number, bits: number): string | null {
  const weight = modelSizeGB(params, bits);
  const sorted = [...GPUS].sort((a, b) => a.vramGB - b.vramGB);
  for (const gpu of sorted) {
    const budget = weightsBudget({
      vramGB: gpu.vramGB,
      contextTokens: 8192,
      batchSize: 1,
      headroomPct: 15,
    });
    if (classifyFit(weight, budget) === 'fits') {
      return gpu.slug;
    }
  }
  return null;
}

export function registerAllModelViews(): void {
  if (registered) return;
  registered = true;

  const q4 = QUANTS.find((q) => q.id === 'q4km');
  const fp16 = QUANTS.find((q) => q.id === 'fp16');
  if (!q4 || !fp16) {
    throw new Error(
      "registerAllModelViews: required quants 'q4km' and 'fp16' missing from QUANTS catalog",
    );
  }

  for (const m of MODELS) {
    // Side-effect free: modelBySlug confirms self-consistency even though
    // we already have `m` in hand. Keeps the import surface used.
    if (!modelBySlug(m.slug)) continue;

    const similar = similarModelsByParams(m.slug, 0.3);
    const siblingSlug = similar[0]?.slug ?? m.slug;
    const smallestQ4 = smallestFittingGpuSlug(m.params, q4.bits);
    const smallestFp16 = smallestFittingGpuSlug(m.params, fp16.bits);

    const view = defineAgentView({
      intent: {
        purpose: `Show what hardware can run ${m.name}.`,
        audience: ['ai-engineer', 'self-hoster', 'model-evaluator'],
        capability: [
          'inspect_model_specs',
          'find_compatible_gpus',
          'compare_similar_models',
          'open_huggingface',
        ],
      },
      state: () => ({
        slug: m.slug,
        name: m.name,
        hf_repo: m.hfRepo,
        params_b: m.params,
        active_params_b: m.activeParams ?? null,
        family: m.family,
        type: m.type,
        context_k: m.contextK,
        fp16_gb: m.fp16GB,
        summary: m.summary,
        smallest_fitting_gpu_q4: smallestQ4,
        smallest_fitting_gpu_fp16: smallestFp16,
      }),
      actions: [
        {
          id: 'open_huggingface',
          method: 'GET',
          href: `https://huggingface.co/${m.hfRepo}`,
        },
        {
          id: 'view_compatible_gpus',
          method: 'GET',
          href: `/model/${m.slug}`,
        },
        {
          id: 'compare_similar',
          method: 'GET',
          href: `/model/${siblingSlug}`,
        },
        {
          id: 'view_calculator',
          method: 'GET',
          href: '/#calculator',
        },
      ],
      context: () => m.summary,
      nav: () => ({
        self: `/model/${m.slug}`,
        parents: ['/'],
        peers: similar.map((s) => `/model/${s.slug}`),
        drilldown: '/the-math',
      }),
    });

    registerAgentRoute(`/model/${m.slug}`, view);
  }
}
