/**
 * AVL view registration for the home route (/).
 *
 * Exposes `registerHomeView()`. The central `src/app/agent-views.ts`
 * imports + invokes it so the postbuild emitter picks up the home
 * companion document. Self-guarded; repeated calls are no-ops.
 */
import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GPUS } from '@/lib/gpus';
import { MODELS } from '@/lib/models';

let registered = false;

export function registerHomeView(): void {
  if (registered) return;
  registered = true;

  const home = defineAgentView({
    intent: {
      purpose:
        'Calculate VRAM budget for local LLM inference. Find a GPU that fits a model, or a model that fits a GPU.',
      audience: [
        'ai-engineer',
        'ml-researcher',
        'self-hoster',
        'homelab-buyer',
      ],
      capability: [
        'compute_budget',
        'find_compatible_gpus',
        'find_compatible_models',
        'view_math',
        'search_huggingface',
      ],
    },
    state: () => ({
      formula: 'modelSizeGB = params * (bits / 8)',
      voice: 'frontier-operations',
      site_version: '0.1.0',
      gpu_catalog_size: GPUS.length,
      model_catalog_size: MODELS.length,
      gpu_index: '/gpu/rtx-4090',
      model_index: '/model/llama-3-1-70b',
    }),
    actions: [
      { id: 'calculate', method: 'GET', href: '/#calculator' },
      { id: 'view_math', method: 'GET', href: '/the-math' },
      { id: 'browse_gpus', method: 'GET', href: '/gpu/rtx-4090' },
      { id: 'browse_models', method: 'GET', href: '/model/llama-3-1-70b' },
    ],
    context: () =>
      'vrambudget.com shows the math behind local LLM memory budgets. Every other "can I run this LLM" tool lists models without showing the formula. This one shows the formula, then lists models. The interactive calculator takes GPU + context + concurrency + safety headroom and returns how much VRAM is left for weights. The /the-math page explains every term. Per-GPU and per-model pages show the precomputed fit matrix.',
    nav: () => ({
      self: '/',
      drilldown: '/the-math',
      peers: ['/the-math'],
    }),
  });

  registerAgentRoute('/', home);
}
