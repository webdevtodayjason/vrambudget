import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Calculator from '@/components/Calculator';
import GiscusComments from '@/components/GiscusComments';
import { buildOgQuery, resolveCalcParams } from '@/lib/og-calc';

// /calc renders dynamic per-request so generateMetadata({ searchParams })
// can build a config-specific OG image URL. Every other route is
// force-static; this is the only dynamic route.
export const dynamic = 'force-dynamic';

type CalcSearchParams = Record<string, string | string[] | undefined>;

function flattenSearchParams(sp: CalcSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') out[k] = v;
    else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') out[k] = v[0];
  }
  return out;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CalcSearchParams>;
}): Promise<Metadata> {
  const sp = flattenSearchParams(await searchParams);
  const resolved = resolveCalcParams(sp);
  const ogQuery = buildOgQuery(resolved);
  const ogImageUrl = `/api/og/calc${ogQuery}`;
  const titleSuffix = resolved.gpu
    ? `${resolved.gpu.name} at ${resolved.contextLabel} ctx`
    : 'shareable VRAM budget calculator';
  return {
    title: 'Calculator',
    description:
      'Compute your VRAM budget. Share the URL. /calc?gpu=4090&ctx=32k&conc=4 carries every setting.',
    alternates: {
      types: { 'text/agent-view': '/calc.agent' },
    },
    openGraph: {
      type: 'website',
      siteName: 'vrambudget',
      title: `vrambudget: ${titleSuffix}`,
      description: resolved.gpu
        ? `${resolved.gpu.name} ${resolved.gpu.vramGB}GB · ctx ${resolved.contextLabel} · conc ${resolved.concurrency} · ${resolved.weightsBudget.toFixed(1)}GB weights budget`
        : 'Plug in your GPU. See what actually fits.',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'vrambudget calculator configuration',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `vrambudget: ${titleSuffix}`,
      images: [ogImageUrl],
    },
  };
}

export default function CalcPage() {
  return (
    <>
      <Nav active="calculator" />

      <section
        style={{
          paddingTop: 64,
          paddingBottom: 32,
          borderBottom: '1px solid var(--line)',
        }}
      >
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>calc</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 'clamp(40px, 5vw, 64px)',
              letterSpacing: '-0.03em',
              fontWeight: 500,
              margin: '20px 0 12px',
              lineHeight: 1.05,
            }}
          >
            Calculator
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'var(--text-dim)',
              maxWidth: 680,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Tune the inputs. Hit copy link. The URL carries every setting, so
            you can DM a friend a thread of {'“'}what fits on a 4090 at 32K context
            {'”'} and they land on the answer.
          </p>
          <p
            style={{
              marginTop: 24,
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            ?gpu=4090 · ?ctx=32k · ?conc=4 · ?safety=10 · ?tab=size
          </p>
        </div>
      </section>

      <section style={{ padding: '32px 0 80px' }}>
        <div className="container">
          <Calculator />
        </div>
      </section>

      <GiscusComments category="Q&A" />

      <Footer route="/calc" />
    </>
  );
}
