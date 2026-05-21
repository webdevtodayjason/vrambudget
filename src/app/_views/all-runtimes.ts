import { defineAgentView, registerAgentRoute } from '@/lib/avl';
import { RUNTIMES, otherRuntimes } from '@/lib/runtimes';

let registered = false;

export function registerAllRuntimeViews(): void {
  if (registered) return;
  registered = true;

  for (const r of RUNTIMES) {
    const view = defineAgentView({
      intent: {
        purpose: `Install, configure, and serve LLMs with ${r.name}.`,
        audience: ['self-hoster', 'ai-engineer', 'mac-user', 'devops-engineer'],
        capability: ['install', 'serve_local_llms', 'compare_runtimes', 'open_external_docs'],
      },
      state: () => ({
        slug: r.slug,
        name: r.name,
        family: r.family,
        type: r.type,
        license: r.license,
        primary_platform: r.primaryPlatform,
        platforms: r.platforms,
        model_formats: r.modelFormats,
        api_compatibility: r.apiCompat,
        install_command: r.installCommand,
        install_secondary: r.installSecondary ?? null,
        homepage_url: r.homepageUrl,
        github_url: r.githubUrl,
        docs_url: r.docsUrl,
        feature_count: r.features.length,
        feature_labels: r.features.map((f) => f.label),
        best_for: r.bestFor,
        caveats: r.caveats,
      }),
      actions: [
        { id: 'open_homepage', method: 'GET', href: r.homepageUrl },
        { id: 'open_github', method: 'GET', href: r.githubUrl },
        { id: 'open_docs', method: 'GET', href: r.docsUrl },
        { id: 'view_index', method: 'GET', href: '/runtime/' },
        { id: 'view_calculator', method: 'GET', href: '/#calculator' },
      ],
      context: () => r.summary,
      nav: () => ({
        self: `/runtime/${r.slug}`,
        parents: ['/', '/runtime/'],
        peers: otherRuntimes(r.slug, 4).map((s) => `/runtime/${s.slug}`),
        drilldown: '/#calculator',
      }),
    });

    registerAgentRoute(`/runtime/${r.slug}`, view);
  }
}
