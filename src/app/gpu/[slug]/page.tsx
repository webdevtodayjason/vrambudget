import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Calculator from '@/components/Calculator';
import { GPUS, gpuBySlug, nearbyGpusByVram, type GPU } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { bestQuantForBudget } from '@/lib/quants';
import { weightsBudget, modelSizeGB, classifyFit, fmtGB, type FitClass } from '@/lib/vram';

type Params = { slug: string };

export const dynamic = 'force-static';

export async function generateStaticParams(): Promise<Params[]> {
  return GPUS.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gpu = gpuBySlug(slug);
  if (!gpu) {
    return { title: 'Not found · vrambudget' };
  }
  return {
    title: `${gpu.name} · ${gpu.vramGB}GB — vrambudget`,
    description: gpu.summary,
    alternates: {
      types: {
        'text/agent-view': `/gpu/${slug}.agent`,
      },
    },
  };
}

function fmtCommaThousands(n: number): string {
  return n.toLocaleString('en-US');
}

function barColor(fit: FitClass): string {
  if (fit === 'fits') return 'var(--accent)';
  if (fit === 'tight') return 'var(--yellow)';
  return 'var(--red)';
}

function compareArrow(other: GPU, current: GPU): string {
  return other.vramGB < current.vramGB ? '← step down' : 'step up →';
}

export default async function GpuDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const gpu = gpuBySlug(slug);
  if (!gpu) {
    notFound();
  }

  const budget = weightsBudget({
    vramGB: gpu.vramGB,
    contextTokens: 8192,
    batchSize: 1,
    headroomPct: 15,
  });

  const rows = MODELS.map((m) => {
    const best = bestQuantForBudget(m.params, gpu.budget8kGB);
    const weight = modelSizeGB(m.params, best.bits);
    const fit = classifyFit(weight, budget);
    const pctOfBudget = (weight / gpu.budget8kGB) * 100;
    return { model: m, best, weight, fit, pctOfBudget };
  });

  const fitsArr = rows
    .filter((r) => r.fit === 'fits')
    .sort((a, b) => b.model.params - a.model.params);
  const tightArr = rows
    .filter((r) => r.fit === 'tight')
    .sort((a, b) => b.model.params - a.model.params);
  const overArr = rows
    .filter((r) => r.fit === 'over')
    .sort((a, b) => a.model.params - b.model.params);
  const top12 = [...fitsArr, ...tightArr, ...overArr].slice(0, 12);

  const siblings = nearbyGpusByVram(gpu.slug, 4);

  const badgeStyle = {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  };

  return (
    <>
      <Nav active="gpus" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <Link href="/#calculator">gpu</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>{gpu.slug}</span>
          </div>
          <h1>
            {gpu.name}{' '}
            <span className="accent">
              {gpu.vramGB}
              <span style={{ fontSize: '0.55em' }}>GB</span>
            </span>
          </h1>
          <p className="summary">{gpu.summary}</p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">VRAM</div>
              <div className="v tnum">
                {gpu.vramGB}
                <span className="unit">GB</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Bandwidth</div>
              <div className="v tnum">
                {fmtCommaThousands(gpu.bandwidthGBs)}
                <span className="unit">GB/s</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">FP16 compute</div>
              <div className="v tnum">
                {gpu.fp16Tflops}
                <span className="unit">TFLOPS</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Budget @ ctx 8K</div>
              <div className="v tnum">
                {fmtGB(gpu.budget8kGB)}
                <span className="unit">GB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Tuned to this card.</h2>
            <div className="right">{`$ ./vrambudget --gpu ${gpu.slug}`}</div>
          </div>
          <Calculator initialGpu={gpu.slug} />
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>{`Models that fit on a ${gpu.name}.`}</h2>
            <div className="right">{`$ grep "fits" models.json | head -12`}</div>
          </div>
          <div className="fit-table">
            <div className="head">
              <span>Model</span>
              <span style={{ textAlign: 'right' }}>Params</span>
              <span>Best quant</span>
              <span>{`Weights / ${fmtGB(gpu.budget8kGB)} GB budget`}</span>
              <span style={{ textAlign: 'right' }}>Fit</span>
            </div>
            {top12.map((row) => (
              <Link
                key={row.model.slug}
                href={`/model/${row.model.slug}`}
                className="fit-row"
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                <span className="name">{row.model.name}</span>
                <span className="params">{`${row.model.params}B`}</span>
                <span className="quant">{row.best.label.toUpperCase()}</span>
                <span className="bar-cell">
                  <span className="mini-bar">
                    <div
                      style={{
                        width: `${row.pctOfBudget}%`,
                        background: barColor(row.fit),
                      }}
                    />
                  </span>
                  <span className="mini-pct">{fmtGB(row.weight)}</span>
                </span>
                <span className="badge-cell">
                  <span className={`pill ${row.fit}`}>{row.fit}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Compare to…</h2>
            <div className="right">{`$ ./vrambudget --compare`}</div>
          </div>
          <div className="compare">
            {siblings.map((other) => (
              <Link
                key={other.slug}
                href={`/gpu/${other.slug}`}
                className="compare-card"
              >
                <span className="arrow">{compareArrow(other, gpu)}</span>
                <span className="name">{other.name}</span>
                <span className="v tnum">
                  {other.vramGB}
                  <span className="unit">GB</span>
                </span>
                <span style={badgeStyle}>{other.badge}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer route={`/gpu/${gpu.slug}`} />
    </>
  );
}
