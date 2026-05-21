import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { GLOSSARY } from '@/lib/glossary';

let registered = false;

export function registerGlossaryView(): void {
  if (registered) return;
  registered = true;

  const view = defineAgentView({
    intent: {
      purpose: 'Explain the technical terms used in local LLM memory budgeting. Educational reference for the calculator and the math page.',
      audience: ['ai-newcomer', 'ai-engineer', 'self-hoster', 'student'],
      capability: ['define_term', 'jump_to_anchor', 'follow_related'],
    },
    state: () => ({
      total_terms: GLOSSARY.length,
      terms: GLOSSARY.map((t) => ({
        slug: t.slug,
        term: t.term,
        one_liner: t.oneLiner,
        related: t.related,
        anchor: `/glossary#${t.slug}`,
      })),
    }),
    actions: [
      ...GLOSSARY.slice(0, 6).map((t) => ({
        id: `jump_to_${t.slug.replace(/-/g, '_')}`,
        method: 'GET' as const,
        href: `/glossary#${t.slug}`,
      })),
      { id: 'view_math', method: 'GET' as const, href: '/the-math' },
      { id: 'view_calculator', method: 'GET' as const, href: '/#calculator' },
    ],
    context: () =>
      'A single-page glossary covering every term used in the VRAM budgeting math. Designed for readers who have read about local LLM inference and want plain-English definitions of KV cache, GQA, MoE, paged attention, quantization formats (Q4_K_M, AWQ, GPTQ, GGUF), context window, concurrency, framework overhead, safety headroom, tensor / pipeline / expert parallelism, flash attention, speculative decoding, tokens/sec, and TTFT.',
    nav: () => ({
      self: '/glossary',
      parents: ['/'],
      peers: ['/the-math', '/calc'],
      drilldown: '/the-math',
    }),
  });

  registerAgentRoute('/glossary', view);
}
