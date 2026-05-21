import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { GPUS, GPU_CATEGORIES, type GpuCategory } from '@/lib/gpus';

export const metadata: Metadata = {
  title: 'GPUs',
  description:
    'Every GPU in the catalog: 40 cards across NVIDIA RTX 30/40/50, Apple Silicon, workstation, datacenter, AMD, and Intel.',
  alternates: {
    types: { 'text/agent-view': '/gpu/index.agent' },
  },
};

export const dynamic = 'force-static';

export default function GpuIndexPage() {
  const groups: { cat: (typeof GPU_CATEGORIES)[number]; gpus: typeof GPUS }[] =
    GPU_CATEGORIES.map((cat) => ({
      cat,
      gpus: GPUS.filter((g) => g.category === cat.id),
    })).filter((g) => g.gpus.length > 0);

  return (
    <>
      <Nav active="gpus" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>gpu</span>
          </div>
          <h1>GPUs</h1>
          <p className="summary">
            Every GPU in the catalog. Click a card for the math: bandwidth, FP16
            compute, weights budget at ctx 8K, and which models fit.
          </p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">Total</div>
              <div className="v tnum">
                {GPUS.length}
                <span className="unit">cards</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Families</div>
              <div className="v tnum">
                {GPU_CATEGORIES.length}
                <span className="unit">groups</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Smallest</div>
              <div className="v tnum">
                {Math.min(...GPUS.map((g) => g.vramGB))}
                <span className="unit">GB</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Largest</div>
              <div className="v tnum">
                {Math.max(...GPUS.map((g) => g.vramGB))}
                <span className="unit">GB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-jump">
        <div className="container">
          <div className="quick-jump-strip" role="navigation" aria-label="Jump to GPU family">
            <span className="quick-jump-label">{'// '}jump to</span>
            {groups.map(({ cat, gpus }) => (
              <a key={cat.id} href={`#family-${cat.id}`} className="quick-jump-chip">
                {cat.label}
                <span className="quick-jump-count">{gpus.length}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {groups.map(({ cat, gpus }) => (
        <section key={cat.id} id={`family-${cat.id}`} style={{ scrollMarginTop: 80 }}>
          <div className="container">
            <div className="section-head">
              <h2>{cat.label}</h2>
              <div className="right">
                {cat.sub} · {gpus.length} card{gpus.length === 1 ? '' : 's'}
              </div>
            </div>
            <div
              className="gpu-grid"
              style={{ border: '1px solid var(--line)', marginBottom: 32 }}
            >
              {gpus.map((g) => (
                <Link
                  key={g.slug}
                  href={`/gpu/${g.slug}/`}
                  className="gpu-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="badge">{g.badge}</div>
                  <div className="name">{g.name}</div>
                  <div className="vram tnum">
                    {g.vramGB}
                    <span className="unit">GB</span>
                  </div>
                  <span className="gpu-card-link">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Footer route="/gpu" />
    </>
  );
}
