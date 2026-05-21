/**
 * Postbuild AVL emitter.
 *
 * After `next build` (with `output: 'export'`) writes the static site to
 * `out/`, this script walks the project's AVL route registry and emits
 * one `.agent` companion file per route, plus a top-level `agent.txt`
 * manifest pointing crawlers from each human URL to its AVL sibling.
 *
 * @frontier-infra/avl@0.1.0 ships no static emitter — that's why this
 * lives in-repo. If the package ever adds `generateStaticAgentViews`,
 * this file becomes a thin shim around it.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  AGENT_ROUTES,
  buildAgentDocument,
  serialize,
  type AgentRequestContext,
} from '../src/lib/avl';

// Side-effect import: loads the registry by importing every route module.
import '../src/app/agent-views';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_DIR = resolve(__dirname, '..', 'out');

/**
 * Map a route pattern to a filesystem path under `out/`.
 *
 *   /                  -> out/index.agent
 *   /the-math          -> out/the-math.agent
 *   /gpu/rtx-4090      -> out/gpu/rtx-4090.agent
 *
 * Note: the human pages live at `out/the-math/index.html` (trailing slash
 * routing), but the AVL sibling is at `out/the-math.agent` per the AVL
 * `<route>.agent` convention.
 */
function patternToOutputPath(pattern: string): string {
  if (pattern === '/') return join(OUT_DIR, 'index.agent');
  const trimmed = pattern.replace(/^\/+/, '').replace(/\/+$/, '');
  return join(OUT_DIR, `${trimmed}.agent`);
}

/**
 * Map a route pattern to its URL form for the manifest (no extension
 * juggling, just the agent-companion URL).
 *
 *   /                  -> /index.agent
 *   /the-math          -> /the-math.agent
 *   /gpu/rtx-4090      -> /gpu/rtx-4090.agent
 */
function patternToAgentUrl(pattern: string): string {
  if (pattern === '/') return '/index.agent';
  const trimmed = pattern.replace(/\/+$/, '');
  return `${trimmed}.agent`;
}

async function main(): Promise<void> {
  if (AGENT_ROUTES.length === 0) {
    console.warn('[avl-emit] no routes registered — nothing to emit');
  }

  const ctx: AgentRequestContext = {
    user: { id: 'anonymous', role: 'public' },
    params: {},
  };

  const manifestLines: string[] = [
    '# AVL manifest for vrambudget.com',
    '# Format: <human-route> <agent-companion-url>',
  ];

  let written = 0;
  for (const { pattern, view } of AGENT_ROUTES) {
    const rendered = await view.render(ctx);
    const doc = buildAgentDocument(pattern, rendered);
    const body = serialize(doc);

    const outPath = patternToOutputPath(pattern);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, body, 'utf8');

    manifestLines.push(`${pattern} ${patternToAgentUrl(pattern)}`);
    written += 1;
  }

  const manifestPath = join(OUT_DIR, 'agent.txt');
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(manifestPath, manifestLines.join('\n') + '\n', 'utf8');

  console.log(`[avl-emit] wrote ${written} .agent files + 1 manifest`);
}

main().catch((err) => {
  console.error('[avl-emit] failed:', err);
  process.exit(1);
});
