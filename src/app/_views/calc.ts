import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GPUS } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { QUANTS } from '@/lib/quants';

let registered = false;

export function registerCalcView(): void {
  if (registered) return;
  registered = true;

  const view = defineAgentView({
    intent: {
      purpose: 'Interactive calculator with shareable URL state. Tune GPU + context + concurrency + safety; copy a link.',
      audience: ['ai-engineer', 'self-hoster', 'hardware-shopper'],
      capability: ['compute_budget', 'share_via_url', 'find_compatible_models', 'find_compatible_gpus'],
    },
    state: () => ({
      url_schema: {
        gpu: 'slug or alias (rtx-4090, 4090, m3-ultra, m5-max)',
        vram: 'integer GB, 4-1024 (overrides stock VRAM)',
        ctx: 'token count or short form (8k, 32k, 128k)',
        conc: 'integer concurrency, 1-64',
        safety: 'integer percent, 0-50',
        tab: 'curated | search | size',
        q: 'huggingface search query (search tab only)',
        model: 'model slug to highlight in curated list',
      },
      defaults: {
        gpu: 'rtx-4090',
        ctx: 8192,
        conc: 1,
        safety: 15,
        tab: 'curated',
      },
      example_urls: [
        '/calc?gpu=4090&ctx=32k&conc=4',
        '/calc?gpu=m3-ultra&ctx=128k&conc=1',
        '/calc?gpu=h100&ctx=8k&conc=16&safety=10',
        '/calc?tab=size',
        '/calc?tab=search&q=llama',
      ],
      gpu_catalog_size: GPUS.length,
      model_catalog_size: MODELS.length,
      quant_catalog_size: QUANTS.length,
    }),
    actions: [
      { id: 'load_default', method: 'GET', href: '/calc' },
      { id: 'load_rtx_4090_32k', method: 'GET', href: '/calc?ctx=32k' },
      { id: 'load_h100_128k', method: 'GET', href: '/calc?gpu=h100&ctx=128k' },
      { id: 'view_math', method: 'GET', href: '/the-math' },
      { id: 'browse_gpus', method: 'GET', href: '/gpu/' },
      { id: 'browse_models', method: 'GET', href: '/model/' },
    ],
    context: () =>
      'The calculator is interactive and stateful via URL query params. Defaults are stripped (so a default-state URL is just /calc). GPU short aliases supported: 4090, 3090, 5090, m5-max, m3-ultra, h100, etc. Context accepts short forms like 8k, 32k, 128k. Tab values: curated | search | size. The "↗ copy link" button in the calculator header copies the current URL to clipboard.',
    nav: () => ({
      self: '/calc',
      parents: ['/'],
      peers: ['/gpu/', '/model/', '/runtime/', '/the-math'],
    }),
  });

  registerAgentRoute('/calc', view);
}
