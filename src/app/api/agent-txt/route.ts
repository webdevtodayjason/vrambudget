import { NextResponse } from 'next/server';

import { AGENT_ROUTES } from '@/lib/avl';

// Trigger AVL view registration so AGENT_ROUTES is populated.
import '@/app/agent-views';

export const dynamic = 'force-dynamic';

// Map a registered route pattern to its agent companion URL.
// Home is special: "/" maps to "/index.agent" by convention.
function patternToAgentUrl(pattern: string): string {
  if (pattern === '/') return '/index.agent';
  return `${pattern}.agent`;
}

export async function GET() {
  const lines = [
    '# AVL manifest for vrambudget.com',
    '# Format: <human-route> <agent-companion-url>',
    ...AGENT_ROUTES.map((r) => `${r.pattern} ${patternToAgentUrl(r.pattern)}`),
  ];
  const body = lines.join('\n') + '\n';

  return new NextResponse(body, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  });
}
