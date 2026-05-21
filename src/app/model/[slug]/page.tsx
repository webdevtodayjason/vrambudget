import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GiscusComments from '@/components/GiscusComments';
import {
  MODELS,
  modelBySlug,
  similarModelsByParams,
} from '@/lib/models';
import { GPUS, type GPU } from '@/lib/gpus';
import { QUANTS, type Quant } from '@/lib/quants';
import {
  weightsBudget,
  modelSizeGB,
  classifyFit,
  fmtGB,
  type FitClass,
} from '@/lib/vram';

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return MODELS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = modelBySlug(slug);
  if (!m) {
    return { title: { absolute: 'not found · vrambudget' } };
  }
  return {
    title: { absolute: `${m.name} · ${m.params}B params — vrambudget` },
    description: m.summary,
    alternates: {
      types: { 'text/agent-view': `/model/${m.slug}.agent` },
    },
  };
}

export const dynamic = 'force-static';

// Recommendation columns. Labels match the design verbatim (no slashes).
const REC_QUANTS: { quant: Quant; label: string }[] = (() => {
  const find = (id: string): Quant => {
    const q = QUANTS.find((x) => x.id === id);
    if (!q) throw new Error(`model page: quant '${id}' missing from QUANTS catalog`);
    return q;
  };
  return [
    { quant: find('fp16'), label: 'FP16' },
    { quant: find('q8'), label: 'Q8_0' },
    { quant: find('q6k'), label: 'Q6_K' },
    { quant: find('q5km'), label: 'Q5_K_M' },
    { quant: find('q4km'), label: 'Q4_K_M' },
  ];
})();

type GpuPick = { gpu: GPU; fit: FitClass };

/**
 * Pick 4 GPUs for a given weight (GB).
 *
 * 1. Take all GPUs whose 8K budget can hold the weight (fit === 'fits'),
 *    sort ascending by vramGB, take the smallest 4.
 * 2. If fewer than 4 fit cleanly, fill with the largest non-fitting GPUs
 *    (sorted desc by vramGB so the most-likely-to-work options appear),
 *    classified as 'tight' or 'over' via classifyFit.
 *
 * Sort is stable, so ties in vramGB preserve catalog order — matching the
 * design templates (e.g. m3-max-96 listed before rtx-6000-pro at vram=96).
 */
function pickGpusForWeight(weight: number): GpuPick[] {
  const fitting: GpuPick[] = [];
  const nonFitting: GpuPick[] = [];

  for (const gpu of GPUS) {
    const budget = weightsBudget({
      vramGB: gpu.vramGB,
      contextTokens: 8192,
      batchSize: 1,
      headroomPct: 15,
    });
    const fit = classifyFit(weight, budget);
    if (fit === 'fits') {
      fitting.push({ gpu, fit });
    } else {
      nonFitting.push({ gpu, fit });
    }
  }

  fitting.sort((a, b) => a.gpu.vramGB - b.gpu.vramGB);
  if (fitting.length >= 4) return fitting.slice(0, 4);

  nonFitting.sort((a, b) => b.gpu.vramGB - a.gpu.vramGB);
  return [...fitting, ...nonFitting].slice(0, 4);
}

function fmtParams(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const m = modelBySlug(slug);
  if (!m) notFound();

  const similar = similarModelsByParams(slug, 0.3);

  return (
    <>
      <Nav active="models" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <Link href="/model/">model</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>{m.hfRepo}</span>
          </div>
          <h1>{m.name}</h1>
          <p className="summary">{m.summary}</p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">Parameters</div>
              <div className="v tnum">
                {fmtParams(m.params)}
                <span className="unit">B</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Family</div>
              <div className="v">{m.family}</div>
            </div>
            <div className="detail-stat">
              <div className="k">Context</div>
              <div className="v tnum">
                {m.contextK}
                <span className="unit">K tokens</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">FP16 weights</div>
              <div className="v tnum">
                {fmtGB(m.fp16GB)}
                <span className="unit">GB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>What you need to run this.</h2>
            <div className="right">{`$ ./vrambudget --model ${m.slug} --by quant`}</div>
          </div>
          <div className="gpu-recs">
            {REC_QUANTS.map(({ quant, label }) => {
              const weight = modelSizeGB(m.params, quant.bits);
              const picks = pickGpusForWeight(weight);
              return (
                <div className="rec-col" key={quant.id}>
                  <div className="head">
                    <span className="q">{label}</span>
                    <span className="sz tnum">{fmtGB(weight)} GB</span>
                  </div>
                  {picks.map(({ gpu, fit }) => (
                    <Link
                      key={gpu.slug}
                      href={`/gpu/${gpu.slug}`}
                      className="gpu-pick"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      <span className="gname">{gpu.name}</span>
                      <span className="gsize">{`${gpu.vramGB} GB · ${fit}`}</span>
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text-faint)',
              margin: '0 0 80px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {'// budgets shown at ctx 8K, concurrency 1, 15% safety headroom. '}
            <Link href="/#calculator" style={{ color: 'var(--accent)' }}>
              Tune in the calculator →
            </Link>
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Alternatives at this size.</h2>
            <div className="right">$ grep --params similar catalog.json</div>
          </div>
          <div className="compare">
            {similar.map((other) => (
              <Link
                key={other.slug}
                href={`/model/${other.slug}`}
                className="compare-card"
              >
                <span className="arrow">$ similar</span>
                <span className="name">{other.name}</span>
                <span className="v tnum">
                  {fmtParams(other.params)}
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
                  {other.family}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <GiscusComments category="Q&A" />

      <Footer route={`/model/${m.slug}`} />
    </>
  );
}
