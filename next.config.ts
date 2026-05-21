import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Standard build (no `output: 'export'`) so /calc can render dynamic
  // per-URL OG metadata via generateMetadata({ searchParams }). Every other
  // route is marked `export const dynamic = 'force-static'`, so the build
  // still emits them as prerendered HTML — only /calc re-renders on request.
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname),

  // AVL serving: <path>.agent and /agent.txt are virtual; route handlers
  // generate them on demand from the same registry the postbuild emitter
  // used to walk.
  async rewrites() {
    return [
      { source: '/agent.txt', destination: '/api/agent-txt' },
      { source: '/:path*.agent', destination: '/api/agent/:path*' },
    ];
  },
};

export default nextConfig;
