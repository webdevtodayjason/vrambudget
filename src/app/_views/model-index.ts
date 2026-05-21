import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { MODELS } from '@/lib/models';

let registered = false;

export function registerModelIndexView(): void {
  if (registered) return;
  registered = true;

  const families = Array.from(new Set(MODELS.map((m) => m.family)));

  const view = defineAgentView({
    intent: {
      purpose: 'Browse every model in the curated catalog. Find a model that fits a card.',
      audience: ['ai-engineer', 'self-hoster', 'model-evaluator'],
      capability: ['list_all_models', 'compare_by_params', 'open_huggingface', 'drill_into_model'],
    },
    state: () => ({
      total: MODELS.length,
      families: families.map((fam) => ({
        family: fam,
        count: MODELS.filter((m) => m.family === fam).length,
      })),
      params_min_b: Math.min(...MODELS.map((m) => m.params)),
      params_max_b: Math.max(...MODELS.map((m) => m.params)),
      moe_count: MODELS.filter((m) => m.type === 'moe').length,
      slugs: MODELS.map((m) => m.slug),
    }),
    actions: [
      { id: 'view_calculator', method: 'GET', href: '/#calculator' },
      { id: 'view_math', method: 'GET', href: '/the-math' },
      { id: 'browse_gpus', method: 'GET', href: '/gpu/' },
    ],
    context: () =>
      'Index of all curated open-weight models. 20 entries across Meta, Alibaba, Mistral, Microsoft, Google, DeepSeek, Cohere, IBM, BigCode, 01.AI. Each card links to a detail page with the GPU recommendation matrix across FP16 / Q8_0 / Q6_K / Q5_K_M / Q4_K_M quants, and a Hugging Face link.',
    nav: () => ({
      self: '/model/',
      parents: ['/'],
      peers: ['/gpu/'],
      drilldown: '/model/llama-3-1-70b',
    }),
  });

  registerAgentRoute('/model', view);
}
