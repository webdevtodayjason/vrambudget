import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import GiscusComments from '@/components/GiscusComments';
import { MODELS, modelBySlug } from '@/lib/models';
import { GPUS, type GPU } from '@/lib/gpus';
import { bestQuantForBudget } from '@/lib/quants';
import {
  weightsBudget,
  modelSizeGB,
  classifyFit,
  fmtGB,
  type FitClass,
} from '@/lib/vram';
import { modelProvider, gpuManufacturer } from '@/lib/brand-map';

type Params = { slug: string };

export const dynamic = 'force-static';

export async function generateStaticParams(): Promise<Params[]> {
  return MODELS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = modelBySlug(slug);
  if (!m) return { title: { absolute: 'Model not found · vrambudget' } };
  return {
    title: { absolute: `Best GPU for ${m.name} · vrambudget` },
    description: `Ranked GPU recommendations for running ${m.name} locally. Best fit, smallest fit, best price/quality, and the multi-GPU options.`,
    alternates: {
      types: { 'text/agent-view': `/best-gpu-for/${m.slug}.agent` },
    },
  };
}

interface RankedGpu {
  gpu: GPU;
  fit: FitClass;
  bestQuantLabel: string;
  bestQuantBits: number;
  weightGB: number;
  budgetGB: number;
  headroomGB: number;
}

function rankGpus(modelParams: number): RankedGpu[] {
  return GPUS.map((g) => {
    const budget = weightsBudget({
      vramGB: g.vramGB,
      contextTokens: 8192,
      batchSize: 1,
      headroomPct: 15,
    });
    const best = bestQuantForBudget(modelParams, g.budget8kGB);
    const weight = modelSizeGB(modelParams, best.bits);
    return {
      gpu: g,
      fit: classifyFit(weight, budget),
      bestQuantLabel: best.label,
      bestQuantBits: best.bits,
      weightGB: weight,
      budgetGB: budget.weightsBudget,
      headroomGB: budget.weightsBudget - weight,
    };
  });
}

const FIT_ORDER: Record<FitClass, number> = { fits: 0, tight: 1, over: 2 };

export default async function BestGpuForPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const m = modelBySlug(slug);
  if (!m) notFound();

  const ranked = rankGpus(m.params);

  // Top picks: best-quality fits sorted by quant bits desc (higher bits =
  // less compression = better quality), then by smallest VRAM (cost) asc.
  const fitsSortedByQuality = ranked
    .filter((r) => r.fit === 'fits')
    .sort((a, b) => {
      if (b.bestQuantBits !== a.bestQuantBits) return b.bestQuantBits - a.bestQuantBits;
      return a.gpu.vramGB - b.gpu.vramGB;
    });

  // Cheapest: fits at any quant, sorted by smallest VRAM.
  const cheapest = ranked
    .filter((r) => r.fit === 'fits')
    .sort((a, b) => a.gpu.vramGB - b.gpu.vramGB)[0];

  // Best Apple Silicon option.
  const bestApple = ranked
    .filter((r) => r.gpu.category === 'apple' && r.fit === 'fits')
    .sort((a, b) => a.gpu.vramGB - b.gpu.vramGB)[0];

  // Best multi-GPU / datacenter option for FP16 ambition.
  const bestDatacenter = ranked
    .filter((r) => r.gpu.category === 'datacenter' && r.fit === 'fits')
    .sort((a, b) => b.bestQuantBits - a.bestQuantBits)[0];

  const topRanked = [...ranked].sort((a, b) => {
    if (FIT_ORDER[a.fit] !== FIT_ORDER[b.fit]) return FIT_ORDER[a.fit] - FIT_ORDER[b.fit];
    if (b.bestQuantBits !== a.bestQuantBits) return b.bestQuantBits - a.bestQuantBits;
    return a.gpu.vramGB - b.gpu.vramGB;
  });

  return (
    <>
      <Nav active="gpus" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>best-gpu-for</span>
            <span className="sep">/</span>
            <Link href={`/model/${m.slug}`} style={{ color: 'var(--text-dim)' }}>
              {m.slug}
            </Link>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginTop: 8,
            }}
          >
            <BrandLogo brand={modelProvider(m.family)} size={28} ariaLabel={`${m.family} provider`} />
            <h1 style={{ margin: 0 }}>Best GPU for {m.name}</h1>
          </div>
          <p className="summary">
            Ranked recommendations from the 42-GPU catalog for running {m.name}
            {' '}({m.params}B params). Top picks by quality, then by cost.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Top picks.</h2>
            <div className="right">$ ./rank --by quality</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 80,
            }}
          >
            {/* Cheapest that fits */}
            {cheapest && (
              <div
                style={{
                  padding: '22px 26px 28px',
                  borderRight: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--green)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  Tightest budget
                </div>
                <Link
                  href={`/gpu/${cheapest.gpu.slug}/`}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 22,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {cheapest.gpu.name}
                </Link>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}
                >
                  {cheapest.gpu.vramGB}GB · runs at {cheapest.bestQuantLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    marginTop: 4,
                  }}
                >
                  {fmtGB(cheapest.weightGB)} GB weights · {fmtGB(cheapest.headroomGB)} GB headroom
                </div>
              </div>
            )}

            {/* Best quality fits */}
            {fitsSortedByQuality[0] && (
              <div
                style={{
                  padding: '22px 26px 28px',
                  borderRight: '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  Best quality
                </div>
                <Link
                  href={`/gpu/${fitsSortedByQuality[0].gpu.slug}/`}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 22,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {fitsSortedByQuality[0].gpu.name}
                </Link>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}
                >
                  {fitsSortedByQuality[0].gpu.vramGB}GB · runs at {fitsSortedByQuality[0].bestQuantLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    marginTop: 4,
                  }}
                >
                  smallest card supporting the best available quant
                </div>
              </div>
            )}

            {/* Apple pick */}
            {bestApple && (
              <div
                style={{
                  padding: '22px 26px 28px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  Apple Silicon
                </div>
                <Link
                  href={`/gpu/${bestApple.gpu.slug}/`}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 22,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {bestApple.gpu.name}
                </Link>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}
                >
                  {bestApple.gpu.vramGB}GB · runs at {bestApple.bestQuantLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    marginTop: 4,
                  }}
                >
                  smallest M-series that fits
                </div>
              </div>
            )}

            {/* Datacenter pick */}
            {bestDatacenter && (
              <div style={{ padding: '22px 26px 28px' }}>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  Datacenter (FP16 ambition)
                </div>
                <Link
                  href={`/gpu/${bestDatacenter.gpu.slug}/`}
                  style={{
                    fontFamily: 'var(--sans)',
                    fontSize: 22,
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {bestDatacenter.gpu.name}
                </Link>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}
                >
                  {bestDatacenter.gpu.vramGB}GB · runs at {bestDatacenter.bestQuantLabel}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    marginTop: 4,
                  }}
                >
                  best-quality datacenter card that fits
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Full ranked list.</h2>
            <div className="right">{`$ ./vrambudget --rank ${m.slug}`}</div>
          </div>
          <div className="fit-table" style={{ marginBottom: 80 }}>
            <div className="head">
              <span>GPU</span>
              <span style={{ textAlign: 'right' }}>VRAM</span>
              <span>Best quant</span>
              <span>Weights at 15% safety</span>
              <span style={{ textAlign: 'right' }}>Fit</span>
            </div>
            {topRanked.slice(0, 18).map((r) => (
              <Link
                key={r.gpu.slug}
                href={`/gpu/${r.gpu.slug}/`}
                className="fit-row"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <span className="name" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <BrandLogo brand={gpuManufacturer(r.gpu.category)} size={14} />
                  {r.gpu.name}
                </span>
                <span className="params">{r.gpu.vramGB}GB</span>
                <span className="quant">{r.bestQuantLabel.toUpperCase()}</span>
                <span className="bar-cell">
                  <span className="mini-bar">
                    <div
                      style={{
                        width: `${Math.min(100, (r.weightGB / r.gpu.budget8kGB) * 100)}%`,
                        background:
                          r.fit === 'fits'
                            ? 'var(--accent)'
                            : r.fit === 'tight'
                              ? 'var(--yellow)'
                              : 'var(--red)',
                      }}
                    />
                  </span>
                  <span className="mini-pct">{fmtGB(r.weightGB)}</span>
                </span>
                <span className="badge-cell">
                  <span className={`pill ${r.fit}`}>{r.fit}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Next steps.</h2>
            <div className="right">$ ./next</div>
          </div>
          <div className="compare" style={{ marginBottom: 80 }}>
            <Link
              href={`/can-i-run/${m.slug}/`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ check</span>
              <span className="name">Can I run {m.name}?</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--accent)',
                }}
              >
                see all quants →
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                full quant matrix
              </span>
            </Link>
            <Link
              href={`/calc/?model=${m.slug}`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ tune</span>
              <span className="name">Tune the math</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--accent)',
                }}
              >
                open calculator →
              </span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                /calc?model={m.slug}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <GiscusComments category="Q&A" />

      <Footer route={`/best-gpu-for/${m.slug}`} />
    </>
  );
}
