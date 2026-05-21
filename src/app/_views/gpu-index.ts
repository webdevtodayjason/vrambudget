import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GPUS, GPU_CATEGORIES } from '@/lib/gpus';

let registered = false;

export function registerGpuIndexView(): void {
  if (registered) return;
  registered = true;

  const view = defineAgentView({
    intent: {
      purpose: 'Browse every GPU in the catalog. Find a card that fits a budget.',
      audience: ['ai-engineer', 'self-hoster', 'homelab-buyer'],
      capability: ['list_all_gpus', 'compare_by_vram', 'drill_into_card'],
    },
    state: () => ({
      total: GPUS.length,
      families: GPU_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
        count: GPUS.filter((g) => g.category === c.id).length,
      })),
      vram_min_gb: Math.min(...GPUS.map((g) => g.vramGB)),
      vram_max_gb: Math.max(...GPUS.map((g) => g.vramGB)),
      slugs: GPUS.map((g) => g.slug),
    }),
    actions: [
      { id: 'view_calculator', method: 'GET', href: '/#calculator' },
      { id: 'view_math', method: 'GET', href: '/the-math' },
      { id: 'browse_models', method: 'GET', href: '/model/' },
    ],
    context: () =>
      'Index of all GPUs the calculator knows about. 40 cards grouped into 8 families (RTX 50/40/30, Apple, workstation, datacenter, AMD, Intel). Each card links to a detail page with bandwidth, FP16 compute, weights budget at ctx 8K, and the precomputed fit table against the 20-model catalog.',
    nav: () => ({
      self: '/gpu/',
      parents: ['/'],
      peers: ['/model/'],
      drilldown: '/gpu/rtx-4090',
    }),
  });

  registerAgentRoute('/gpu', view);
}
