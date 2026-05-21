/**
 * AVL view registration for the /the-math route.
 *
 * Exposes `registerMathView()`. The central `src/app/agent-views.ts`
 * imports + invokes it so the postbuild emitter picks up the math
 * companion document. Self-guarded; repeated calls are no-ops.
 */
import { defineAgentView, registerAgentRoute } from '@/lib/avl';

let registered = false;

export function registerMathView(): void {
  if (registered) return;
  registered = true;

  const math = defineAgentView({
    intent: {
      purpose:
        'Explain the math: weights, KV cache, framework overhead, and concurrency.',
      audience: ['ai-engineer', 'ml-researcher', 'self-hoster'],
      capability: ['understand_formula', 'learn_terminology'],
    },
    state: () => ({
      formula:
        'budget = total_vram * (1 - safety) - kv_cache * concurrency - framework_overhead',
      thesis:
        'VRAM ~= params * (bits / 8). Everything else is overhead.',
      sections: [
        '01 Weight size: the floor',
        '02 KV cache: the context tax',
        '03 Framework overhead: the constant',
        '04 Concurrency: the multiplier',
        '05 The full equation',
        '06 What this site does not do',
      ],
      read_time_min: 14,
    }),
    actions: [
      { id: 'run_calculator', method: 'GET', href: '/#calculator' },
      { id: 'view_home', method: 'GET', href: '/' },
    ],
    context: () =>
      'A long-form explainer of how local LLM memory budgeting actually works. The page walks the additions: weight size, KV cache, framework overhead, concurrency. The thesis: most "can my machine run this" tools skip the math; this one shows it. Includes the VRAM tax example on a stock RTX 4090: 24 GB nominal, ~17.4 GB actual weights budget at ctx 8K, conc 1, 15% safety.',
    nav: () => ({
      self: '/the-math',
      parents: ['/'],
      drilldown: '/#calculator',
    }),
  });

  registerAgentRoute('/the-math', math);
}
