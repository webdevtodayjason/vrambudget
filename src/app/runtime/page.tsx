import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { RUNTIMES, RUNTIME_FAMILIES } from '@/lib/runtimes';

export const metadata: Metadata = {
  title: 'LLM hosting runtimes',
  description:
    'Self-host an LLM on your own computer. Five production runtimes: Ollama, LM Studio, vLLM, MLX, oMLX.',
  alternates: {
    types: { 'text/agent-view': '/runtime/index.agent' },
  },
};

export const dynamic = 'force-static';

export default function RuntimeIndexPage() {
  const groups = RUNTIME_FAMILIES.map((f) => ({
    family: f,
    runtimes: RUNTIMES.filter((r) => r.family === f.id),
  })).filter((g) => g.runtimes.length > 0);

  return (
    <>
      <Nav active="runtimes" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>runtime</span>
          </div>
          <h1>Self-host an LLM</h1>
          <p className="summary">
            Five runtimes for serving open models on your own hardware. Pick by
            platform, throughput, or the kind of agent work you do. Each card
            opens a full install + features walkthrough.
          </p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">Total</div>
              <div className="v tnum">
                {RUNTIMES.length}
                <span className="unit">runtimes</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Cross-platform</div>
              <div className="v tnum">
                {RUNTIMES.filter((r) => r.family === 'cross-platform').length}
                <span className="unit">choices</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Apple Silicon</div>
              <div className="v tnum">
                {RUNTIMES.filter((r) => r.family === 'apple-silicon').length}
                <span className="unit">native</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Server-grade</div>
              <div className="v tnum">
                {RUNTIMES.filter((r) => r.family === 'server').length}
                <span className="unit">production</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {groups.map(({ family, runtimes }) => (
        <section key={family.id}>
          <div className="container">
            <div className="section-head">
              <h2>{family.label}</h2>
              <div className="right">
                {family.sub} · {runtimes.length}{' '}
                {runtimes.length === 1 ? 'option' : 'options'}
              </div>
            </div>
            <div
              className="gpu-grid"
              style={{ border: '1px solid var(--line)', marginBottom: 32 }}
            >
              {runtimes.map((r) => (
                <Link
                  key={r.slug}
                  href={`/runtime/${r.slug}/`}
                  className="gpu-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="badge">{r.badge}</div>
                  <div className="name">{r.name}</div>
                  <div
                    className="vram tnum"
                    style={{ fontSize: 13, lineHeight: 1.4 }}
                  >
                    {r.oneLiner}
                  </div>
                  <span className="gpu-card-link">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Footer route="/runtime" />
    </>
  );
}
