import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { RUNTIMES, RUNTIME_FAMILIES } from '@/lib/runtimes';

let registered = false;

export function registerRuntimeIndexView(): void {
  if (registered) return;
  registered = true;

  const view = defineAgentView({
    intent: {
      purpose: 'Browse the five LLM hosting runtimes. Pick one that fits the platform and workload.',
      audience: ['self-hoster', 'ai-engineer', 'homelab-buyer', 'mac-user'],
      capability: ['list_all_runtimes', 'compare_runtimes', 'drill_into_runtime'],
    },
    state: () => ({
      total: RUNTIMES.length,
      families: RUNTIME_FAMILIES.map((f) => ({
        id: f.id,
        label: f.label,
        count: RUNTIMES.filter((r) => r.family === f.id).length,
      })),
      slugs: RUNTIMES.map((r) => r.slug),
      cross_platform_options: RUNTIMES.filter((r) => r.family === 'cross-platform').map((r) => r.slug),
      apple_silicon_options: RUNTIMES.filter((r) => r.family === 'apple-silicon').map((r) => r.slug),
      server_options: RUNTIMES.filter((r) => r.family === 'server').map((r) => r.slug),
    }),
    actions: [
      { id: 'view_calculator', method: 'GET', href: '/#calculator' },
      { id: 'browse_gpus', method: 'GET', href: '/gpu/' },
      { id: 'browse_models', method: 'GET', href: '/model/' },
    ],
    context: () =>
      'Five LLM hosting runtimes covered in depth: Ollama (cross-platform CLI), LM Studio (cross-platform GUI), vLLM (server-grade production), MLX (Apple framework), oMLX (Apple-native inference server). Each detail page has install commands, full feature list, best-for / caveats, and external links to homepage / GitHub / docs.',
    nav: () => ({
      self: '/runtime/',
      parents: ['/'],
      peers: ['/gpu/', '/model/'],
      drilldown: '/runtime/ollama',
    }),
  });

  registerAgentRoute('/runtime', view);
}
