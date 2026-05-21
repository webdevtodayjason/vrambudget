import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import BrandLogo from '@/components/BrandLogo';
import GiscusComments from '@/components/GiscusComments';
import RuntimeBadges from '@/components/RuntimeBadges';
import { MODELS, modelBySlug } from '@/lib/models';
import { GPUS, type GPU } from '@/lib/gpus';
import { QUANTS, type Quant } from '@/lib/quants';
import {
  weightsBudget,
  modelSizeGB,
  classifyFit,
  fmtGB,
  type FitClass,
} from '@/lib/vram';
import { modelProvider } from '@/lib/brand-map';

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
    title: { absolute: `Can I run ${m.name}? Hardware requirements · vrambudget` },
    description: `What hardware you actually need to run ${m.name} (${m.params}B params) locally. GPU requirements at FP16, Q8, Q5_K_M, and Q4_K_M.`,
    alternates: {
      types: { 'text/agent-view': `/can-i-run/${m.slug}.agent` },
    },
  };
}

const SHOWCASE_QUANT_IDS = ['fp16', 'q8', 'q5km', 'q4km', 'q3km'] as const;

interface QuantTier {
  quant: Quant;
  weightGB: number;
  fitting: GPU[];
  smallest?: GPU;
}

function buildQuantTiers(modelParams: number): QuantTier[] {
  return SHOWCASE_QUANT_IDS.map((qid) => {
    const quant = QUANTS.find((q) => q.id === qid)!;
    const weightGB = modelSizeGB(modelParams, quant.bits);
    const fitting = GPUS
      .filter((g) => {
        const budget = weightsBudget({
          vramGB: g.vramGB,
          contextTokens: 8192,
          batchSize: 1,
          headroomPct: 15,
        });
        return classifyFit(weightGB, budget) === 'fits';
      })
      .sort((a, b) => a.vramGB - b.vramGB);
    return { quant, weightGB, fitting, smallest: fitting[0] };
  });
}

export default async function CanIRunPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const m = modelBySlug(slug);
  if (!m) notFound();

  const tiers = buildQuantTiers(m.params);
  const cheapestFit = tiers.find((t) => t.smallest);
  const cheapestSlug = cheapestFit?.smallest?.slug ?? 'rtx-4090';

  return (
    <>
      <Nav active="models" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>can-i-run</span>
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
            <h1 style={{ margin: 0 }}>Can I run {m.name}?</h1>
          </div>
          <p className="summary">
            Short answer: {cheapestFit ? (
              <>
                <b>yes</b>, on a {cheapestFit.smallest!.name} ({cheapestFit.smallest!.vramGB}GB) at
                {' '}{cheapestFit.quant.label}. Long answer below.
              </>
            ) : (
              <>
                <b>not on a single mainstream card.</b> {m.name} needs multi-GPU or M-series Ultra-class memory even at the most aggressive quants. Details below.
              </>
            )}
          </p>
          <div style={{ marginTop: 28 }}>
            <RuntimeBadges runtimes={m.runtimes} />
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>The math, in one paragraph.</h2>
            <div className="right">{`$ ./vrambudget --explain ${m.slug}`}</div>
          </div>
          <p
            style={{
              maxWidth: 760,
              fontSize: 18,
              lineHeight: 1.65,
              color: 'var(--text)',
              marginBottom: 64,
            }}
          >
            {m.name} has <b>{m.params}B parameters</b>
            {m.type === 'moe' && m.activeParams ? (
              <> (MoE: {m.activeParams}B active per forward pass, but all {m.params}B must fit in memory)</>
            ) : null}.
            At FP16 that&apos;s <b>{fmtGB(m.fp16GB)} GB</b> of raw weights. Quantization shrinks
            that, but you also need budget for the KV cache (
            <Link href="/glossary#kv-cache" style={{ color: 'var(--accent)' }}>
              definition
            </Link>
            ), framework overhead, and safety headroom. The rule of thumb: real
            usable budget on a card is roughly its nameplate VRAM minus 25%.
            That&apos;s how the table below was computed.
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>What hardware actually fits.</h2>
            <div className="right">{`$ grep "fits" gpus.json`}</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 64,
            }}
          >
            {tiers.map((t, idx) => (
              <div
                key={t.quant.id}
                style={{
                  padding: '20px 22px',
                  borderRight: idx === tiers.length - 1 ? 'none' : '1px solid var(--line)',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: 'var(--accent)',
                    letterSpacing: '-0.01em',
                    marginBottom: 4,
                  }}
                >
                  {t.quant.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 24,
                    color: 'var(--text)',
                    fontFeatureSettings: '"tnum"',
                    letterSpacing: '-0.02em',
                    marginBottom: 6,
                  }}
                >
                  {fmtGB(t.weightGB)}
                  <span style={{ fontSize: 13, color: 'var(--text-dim)', marginLeft: 4 }}>
                    GB
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 12,
                  }}
                >
                  {t.fitting.length} {t.fitting.length === 1 ? 'GPU fits' : 'GPUs fit'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {t.fitting.slice(0, 4).map((g) => (
                    <Link
                      key={g.slug}
                      href={`/gpu/${g.slug}/`}
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 12,
                        color: 'var(--text)',
                        textDecoration: 'none',
                      }}
                    >
                      {g.name}
                      <span style={{ color: 'var(--text-faint)', marginLeft: 6 }}>
                        {g.vramGB}GB
                      </span>
                    </Link>
                  ))}
                  {t.fitting.length > 4 && (
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        color: 'var(--text-faint)',
                      }}
                    >
                      + {t.fitting.length - 4} more
                    </span>
                  )}
                  {t.fitting.length === 0 && (
                    <span
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: 12,
                        color: 'var(--red)',
                      }}
                    >
                      — none in the catalog —
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Pick your path.</h2>
            <div className="right">$ ls strategies/</div>
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
                padding: '24px 26px',
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
                Tightest budget
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                Smallest GPU that fits {m.name} at any quant:{' '}
                {cheapestFit ? (
                  <Link href={`/gpu/${cheapestSlug}/`} style={{ color: 'var(--accent)' }}>
                    <b>{cheapestFit.smallest!.name}</b> at {cheapestFit.quant.label}
                  </Link>
                ) : (
                  <b>none in the consumer catalog</b>
                )}.
              </p>
            </div>
            <div
              style={{
                padding: '24px 26px',
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
                Reference quality (FP16)
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                Lossless inference needs <b>{fmtGB(m.fp16GB)} GB</b>. Pick from{' '}
                {tiers[0].fitting.length > 0 ? (
                  <Link href={`/gpu/${tiers[0].fitting[0].slug}/`} style={{ color: 'var(--accent)' }}>
                    {tiers[0].fitting.length} cards
                  </Link>
                ) : (
                  <>multi-GPU only</>
                )}.
              </p>
            </div>
            <div
              style={{
                padding: '24px 26px',
                borderRight: '1px solid var(--line)',
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
                Best quality on a 24GB card
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                {tiers
                  .filter((t) => t.fitting.some((g) => g.vramGB <= 24))
                  .slice(0, 1)
                  .map((t) => (
                    <span key={t.quant.id}>
                      <b>{t.quant.label}</b> fits comfortably (
                      {fmtGB(t.weightGB)} GB weights).
                    </span>
                  ))[0] ?? <span>None of the showcase quants fit on a 24GB card. Step up.</span>}
              </p>
            </div>
            <div style={{ padding: '24px 26px' }}>
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
                Tune the math yourself
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>
                Open the calculator pre-tuned for {m.name}:{' '}
                <Link
                  href={`/calc/?model=${m.slug}`}
                  style={{ color: 'var(--accent)' }}
                >
                  ↗ /calc?model={m.slug}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>See the full model page.</h2>
            <div className="right">$ ./open</div>
          </div>
          <div className="compare" style={{ marginBottom: 80 }}>
            <Link
              href={`/model/${m.slug}/`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ open</span>
              <span className="name">{m.name}</span>
              <span className="v tnum">
                {m.params}
                <span className="unit">B</span>
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
                {m.family} · ctx {m.contextK}K
              </span>
            </Link>
            <Link
              href={`/best-gpu-for/${m.slug}/`}
              className="compare-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <span className="arrow">$ rank</span>
              <span className="name">Best GPU for {m.name}</span>
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--accent)',
                }}
              >
                see the ranking →
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
                ranked by fit quality
              </span>
            </Link>
          </div>
        </div>
      </section>

      <GiscusComments category="Q&A" />

      <Footer route={`/can-i-run/${m.slug}`} />
    </>
  );
}
