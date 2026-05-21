import { NextResponse } from 'next/server';

import {
  AGENT_ROUTES,
  buildAgentDocument,
  serialize,
} from '@/lib/avl';

// Trigger AVL view registration. Importing agent-views.ts pulls in every
// registrar module, which calls registerAgentRoute() at module load.
import '@/app/agent-views';

export const dynamic = 'force-dynamic';

// Map a request path (e.g. ["gpu", "rtx-4090"]) back to the registered
// pattern (e.g. "/gpu/rtx-4090"). The home route is special — the rewrite
// catches "/index.agent" so we map ["index"] → "/".
function pathToPattern(segments: string[]): string {
  if (segments.length === 1 && segments[0] === 'index') return '/';
  return '/' + segments.join('/');
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path || path.length === 0) {
    return new NextResponse('not found', { status: 404 });
  }

  const pattern = pathToPattern(path);
  const route = AGENT_ROUTES.find((r) => r.pattern === pattern);

  if (!route) {
    return new NextResponse(
      `# agent view not found for ${pattern}\n# manifest: /agent.txt\n`,
      {
        status: 404,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      },
    );
  }

  const rendered = await route.view.render({
    user: { id: 'anonymous', role: 'public' },
    params: {},
  });
  const doc = buildAgentDocument(pattern, rendered);
  const body = serialize(doc);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'text/agent-view; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=300',
    },
  });
}
