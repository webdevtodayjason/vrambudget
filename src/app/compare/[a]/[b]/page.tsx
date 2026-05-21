import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import GiscusComments from '@/components/GiscusComments';
import { GPUS, gpuBySlug, type GPU } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { bestQuantForBudget } from '@/lib/quants';
import { weightsBudget, modelSizeGB, classifyFit, fmtGB, type FitClass } from '@/lib/vram';
import { gpuManufacturer } from '@/lib/brand-map';
import { POPULAR_COMPARISONS, canonicalPair } from '@/lib/compare';

type Params = { a: string; b: string };

export const dynamic = 'force-static';

export async function generateStaticParams(): Promise<Params[]> {
  return POPULAR_COMPARISONS.map(({ a, b }) => {
    const c = canonicalPair(a, b);
    return { a: c.a, b: c.b };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { a, b } = await params;
  const ga = gpuBySlug(a);
  const gb = gpuBySlug(b);
  if (!ga || !gb) return { title: { absolute: 'Comparison not found · vrambudget' } };
  return {
    title: { absolute: `${ga.name} vs ${gb.name} for LLMs · vrambudget` },
    description: `Head-to-head: ${ga.name} (${ga.vramGB}GB) vs ${gb.name} (${gb.vramGB}GB) for local LLM inference. VRAM, bandwidth, FP16 compute, and the fit difference across 30 models.`,
    alternates: {
      types: { 'text/agent-view': `/compare/${a}/${b}.agent` },
    },
  };
}

function fmtCommaThousands(n: number): string {
  return n.toLocaleString('en-US');
}

function whichWins(a: number, b: number): 'a' | 'b' | 'tie' {
  if (a === b) return 'tie';
  return a > b ? 'a' : 'b';
}

function deltaPct(a: number, b: number): string {
  if (b === 0) return '∞';
  const d = ((a - b) / b) * 100;
  const sign = d > 0 ? '+' : '';
  return `${sign}${d.toFixed(0)}%`;
}

interface FitRow {
  modelSlug: string;
  modelName: string;
  params: number;
  bestQuantA: string;
  weightA: number;
  fitA: FitClass;
  bestQuantB: string;
  weightB: number;
  fitB: FitClass;
}

function computeFitDelta(ga: GPU, gb: GPU): FitRow[] {
  return MODELS.map((m) => {
    const bestA = bestQuantForBudget(m.params, ga.budget8kGB);
    const bestB = bestQuantForBudget(m.params, gb.budget8kGB);
    const weightA = modelSizeGB(m.params, bestA.bits);
    const weightB = modelSizeGB(m.params, bestB.bits);
    const budA = weightsBudget({
      vramGB: ga.vramGB,
      contextTokens: 8192,
      batchSize: 1,
      headroomPct: 15,
    });
    const budB = weightsBudget({
      vramGB: gb.vramGB,
      contextTokens: 8192,
      batchSize: 1,
      headroomPct: 15,
    });
    return {
      modelSlug: m.slug,
      modelName: m.name,
      params: m.params,
      bestQuantA: bestA.label,
      weightA,
      fitA: classifyFit(weightA, budA),
      bestQuantB: bestB.label,
      weightB,
      fitB: classifyFit(weightB, budB),
    };
  });
}

const STAT_ROWS: {
  key: keyof GPU;
  label: string;
  unit?: string;
  comma?: boolean;
}[] = [
  { key: 'vramGB', label: 'VRAM', unit: 'GB' },
  { key: 'bandwidthGBs', label: 'Memory bandwidth', unit: 'GB/s', comma: true },
  { key: 'fp16Tflops', label: 'FP16 compute', unit: 'TFLOPS' },
  { key: 'budget8kGB', label: 'Weights budget at 8K ctx', unit: 'GB' },
];

export default async function ComparePage({ params }: { params: Promise<Params> }) {
  const { a, b } = await params;
  const ga = gpuBySlug(a);
  const gb = gpuBySlug(b);
  if (!ga || !gb) notFound();

  const rows = computeFitDelta(ga, gb);
  const fitsOnA = rows.filter((r) => r.fitA === 'fits').length;
  const fitsOnB = rows.filter((r) => r.fitB === 'fits').length;
  const fitsOnBoth = rows.filter((r) => r.fitA === 'fits' && r.fitB === 'fits').length;
  const fitsOnAOnly = rows.filter((r) => r.fitA === 'fits' && r.fitB !== 'fits').length;
  const fitsOnBOnly = rows.filter((r) => r.fitB === 'fits' && r.fitA !== 'fits').length;

  // Show top 12 models where the fit class differs, plus filler.
  const differingRows = rows.filter((r) => r.fitA !== r.fitB).slice(0, 12);
  const sameRows = rows.filter((r) => r.fitA === r.fitB).slice(0, 12 - differingRows.length);
  const shownRows = [...differingRows, ...sameRows].slice(0, 12);

  return (
    <>
      <Nav active="gpus" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <Link href="/gpu/">gpu</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>{`${ga.slug} vs ${gb.slug}`}</span>
          </div>
          <h1 style={{ margin: '8px 0 0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <BrandLogo brand={gpuManufacturer(ga.category)} size={24} ariaLabel={`${ga.name} manufacturer`} />
              <span>{ga.name}</span>
            </span>
            <span style={{ color: 'var(--text-faint)', margin: '0 18px' }}>vs</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
              <BrandLogo brand={gpuManufacturer(gb.category)} size={24} ariaLabel={`${gb.name} manufacturer`} />
              <span>{gb.name}</span>
            </span>
          </h1>
          <p className="summary">
            Head-to-head for local LLM inference. The honest comparison: VRAM,
            bandwidth, compute, and which of the 30 catalog models actually fit
            on each.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>The specs.</h2>
            <div className="right">{`$ diff specs ${ga.slug} ${gb.slug}`}</div>
          </div>
          <div
            className="compare-spec-diff"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 90px 1fr 120px',
              gap: 0,
              border: '1px solid var(--line)',
              fontFamily: 'var(--mono)',
              marginBottom: 64,
            }}
          >
            {/* header row */}
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-dim)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Stat
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-dim)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'right',
              }}
            >
              {ga.slug}
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-dim)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'right',
              }}
            >
              {gb.slug}
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                color: 'var(--text-dim)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'right',
              }}
            >
              Δ
            </div>
            {STAT_ROWS.map((row) => {
              const va = ga[row.key] as number;
              const vb = gb[row.key] as number;
              const winner = whichWins(va, vb);
              const display = (n: number) =>
                row.comma ? fmtCommaThousands(n) : String(n);
              return (
                <div key={row.key} style={{ display: 'contents' }}>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--line)',
                      fontSize: 13,
                      color: 'var(--text)',
                    }}
                  >
                    {row.label}
                  </div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--line)',
                      fontSize: 14,
                      textAlign: 'right',
                      color: winner === 'a' ? 'var(--accent)' : 'var(--text)',
                      fontWeight: winner === 'a' ? 600 : 400,
                    }}
                  >
                    {display(va)}
                    {row.unit && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}> {row.unit}</span>}
                  </div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--line)',
                      fontSize: 14,
                      textAlign: 'right',
                      color: winner === 'b' ? 'var(--accent)' : 'var(--text)',
                      fontWeight: winner === 'b' ? 600 : 400,
                    }}
                  >
                    {display(vb)}
                    {row.unit && <span style={{ color: 'var(--text-dim)', fontSize: 12 }}> {row.unit}</span>}
                  </div>
                  <div
                    style={{
                      padding: '14px 18px',
                      borderBottom: '1px solid var(--line)',
                      fontSize: 12,
                      textAlign: 'right',
                      color: 'var(--text-dim)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {deltaPct(vb, va)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Model fit difference.</h2>
            <div className="right">$ models that change with the card</div>
          </div>
          <div
            className="compare-summary"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderRight: '1px solid var(--line)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}
              >
                Fits on both
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 32,
                  color: 'var(--green)',
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: '-0.02em',
                }}
              >
                {fitsOnBoth}
                <span style={{ fontSize: 14, color: 'var(--text-dim)', marginLeft: 6 }}>
                  of {MODELS.length}
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '20px 24px',
                borderRight: '1px solid var(--line)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}
              >
                Only on {ga.slug}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 32,
                  color: fitsOnAOnly > 0 ? 'var(--accent)' : 'var(--text-faint)',
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: '-0.02em',
                }}
              >
                {fitsOnAOnly}
              </div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 8,
                }}
              >
                Only on {gb.slug}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 32,
                  color: fitsOnBOnly > 0 ? 'var(--accent)' : 'var(--text-faint)',
                  fontFeatureSettings: '"tnum"',
                  letterSpacing: '-0.02em',
                }}
              >
                {fitsOnBOnly}
              </div>
            </div>
          </div>

          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text-faint)',
              marginBottom: 24,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {'// '}showing 12 of {MODELS.length} models; differing fits first
          </p>

          <div
            className="compare-fit-delta"
            style={{
              border: '1px solid var(--line)',
              fontFamily: 'var(--mono)',
              marginBottom: 64,
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr 1fr',
            }}
          >
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                fontSize: 11,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Model
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                fontSize: 11,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'right',
              }}
            >
              {ga.slug}
            </div>
            <div
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid var(--line)',
                fontSize: 11,
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                textAlign: 'right',
              }}
            >
              {gb.slug}
            </div>
            {shownRows.map((r) => (
              <div key={r.modelSlug} style={{ display: 'contents' }}>
                <div
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--line)',
                    fontSize: 13,
                  }}
                >
                  <Link
                    href={`/model/${r.modelSlug}`}
                    style={{ color: 'var(--text)', textDecoration: 'none' }}
                  >
                    {r.modelName}
                    <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>
                      {r.params}B
                    </span>
                  </Link>
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--line)',
                    fontSize: 12,
                    textAlign: 'right',
                  }}
                >
                  <span className={`pill ${r.fitA}`}>{r.fitA}</span>
                  <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                    {r.bestQuantA.toUpperCase()}
                  </span>
                </div>
                <div
                  style={{
                    padding: '12px 18px',
                    borderBottom: '1px solid var(--line)',
                    fontSize: 12,
                    textAlign: 'right',
                  }}
                >
                  <span className={`pill ${r.fitB}`}>{r.fitB}</span>
                  <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                    {r.bestQuantB.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Which one wins for…</h2>
            <div className="right">$ ./recommend --by-workload</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 80,
            }}
          >
            <div
              style={{
                padding: '20px 24px',
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
                More VRAM headroom
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {ga.vramGB === gb.vramGB ? (
                  <>Tied at {ga.vramGB} GB. Choose on bandwidth or price.</>
                ) : ga.vramGB > gb.vramGB ? (
                  <><b style={{ color: 'var(--accent)' }}>{ga.name}</b> has {ga.vramGB - gb.vramGB} GB more.</>
                ) : (
                  <><b style={{ color: 'var(--accent)' }}>{gb.name}</b> has {gb.vramGB - ga.vramGB} GB more.</>
                )}
              </p>
            </div>
            <div
              style={{
                padding: '20px 24px',
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
                Faster decode (bandwidth)
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {ga.bandwidthGBs === gb.bandwidthGBs ? (
                  <>Tied at {fmtCommaThousands(ga.bandwidthGBs)} GB/s.</>
                ) : ga.bandwidthGBs > gb.bandwidthGBs ? (
                  <><b style={{ color: 'var(--accent)' }}>{ga.name}</b> by {deltaPct(ga.bandwidthGBs, gb.bandwidthGBs)}.</>
                ) : (
                  <><b style={{ color: 'var(--accent)' }}>{gb.name}</b> by {deltaPct(gb.bandwidthGBs, ga.bandwidthGBs)}.</>
                )}
              </p>
            </div>
            <div
              style={{
                padding: '20px 24px',
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
                Faster prefill (compute)
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {ga.fp16Tflops === gb.fp16Tflops ? (
                  <>Tied at {ga.fp16Tflops} TFLOPS.</>
                ) : ga.fp16Tflops > gb.fp16Tflops ? (
                  <><b style={{ color: 'var(--accent)' }}>{ga.name}</b> by {deltaPct(ga.fp16Tflops, gb.fp16Tflops)} TFLOPS.</>
                ) : (
                  <><b style={{ color: 'var(--accent)' }}>{gb.name}</b> by {deltaPct(gb.fp16Tflops, ga.fp16Tflops)} TFLOPS.</>
                )}
              </p>
            </div>
            <div style={{ padding: '20px 24px' }}>
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
                Catalog models that fit
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {fitsOnA === fitsOnB ? (
                  <>Tied: {fitsOnA} of {MODELS.length} fit on each.</>
                ) : fitsOnA > fitsOnB ? (
                  <><b style={{ color: 'var(--accent)' }}>{ga.name}</b>: {fitsOnA} fit · {gb.name}: {fitsOnB}.</>
                ) : (
                  <><b style={{ color: 'var(--accent)' }}>{gb.name}</b>: {fitsOnB} fit · {ga.name}: {fitsOnA}.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Drill into either card.</h2>
            <div className="right">$ ./vrambudget --gpu</div>
          </div>
          <div className="compare" style={{ marginBottom: 80 }}>
            <Link
              href={`/gpu/${ga.slug}/`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ open</span>
              <span className="name">{ga.name}</span>
              <span className="v tnum">
                {ga.vramGB}
                <span className="unit">GB</span>
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
                {ga.badge}
              </span>
            </Link>
            <Link
              href={`/gpu/${gb.slug}/`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ open</span>
              <span className="name">{gb.name}</span>
              <span className="v tnum">
                {gb.vramGB}
                <span className="unit">GB</span>
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
                {gb.badge}
              </span>
            </Link>
          </div>
        </div>
      </section>

      <GiscusComments category="Q&A" />

      <Footer route={`/compare/${ga.slug}/${gb.slug}`} />
    </>
  );
}
