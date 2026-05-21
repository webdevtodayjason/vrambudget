/**
 * AVL view registrations for every GPU detail route.
 *
 * Exposes a single function, `registerAllGpuViews()`, which the central
 * AVL registry module (`src/app/agent-views.ts`) calls during S7 wire-up.
 * Self-guarded so repeated calls are safe.
 */
import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GPUS, nearbyGpusByVram } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { bestQuantForBudget } from '@/lib/quants';
import { modelSizeGB } from '@/lib/vram';

let registered = false;

export function registerAllGpuViews(): void {
  if (registered) return;
  registered = true;

  for (const gpu of GPUS) {
    const siblings = nearbyGpusByVram(gpu.slug, 4);

    const view = defineAgentView({
      intent: {
        purpose: `Show what AI models fit on the ${gpu.name}.`,
        audience: ['ai-engineer', 'self-hoster', 'homelab-buyer'],
        capability: [
          'inspect_specs',
          'find_fitting_models',
          'compare_to_other_gpus',
        ],
      },
      state: () => {
        const topFittingModels = MODELS.filter((m) => {
          const best = bestQuantForBudget(m.params, gpu.budget8kGB);
          const weight = modelSizeGB(m.params, best.bits);
          return weight <= gpu.budget8kGB;
        })
          .slice()
          .sort((a, b) => b.params - a.params)
          .slice(0, 5)
          .map((m) => m.slug);

        return {
          slug: gpu.slug,
          name: gpu.name,
          vram_gb: gpu.vramGB,
          bandwidth_gbs: gpu.bandwidthGBs,
          fp16_tflops: gpu.fp16Tflops,
          budget_8k_gb: gpu.budget8kGB,
          category: gpu.category,
          summary: gpu.summary,
          top_fitting_models: topFittingModels,
        };
      },
      actions: [
        ...siblings.map((s) => ({
          id: 'compare',
          method: 'GET' as const,
          href: `/gpu/${s.slug}`,
        })),
        { id: 'view_calculator', method: 'GET' as const, href: '/#calculator' },
        { id: 'view_math', method: 'GET' as const, href: '/the-math' },
      ],
      context: () => gpu.summary,
      nav: () => ({
        self: `/gpu/${gpu.slug}`,
        parents: ['/'],
        peers: siblings.map((s) => `/gpu/${s.slug}`),
        drilldown: '/the-math',
      }),
    });

    registerAgentRoute(`/gpu/${gpu.slug}`, view);
  }
}
