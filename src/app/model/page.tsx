import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { MODELS, type ModelFamily } from '@/lib/models';

export const metadata: Metadata = {
  title: 'Models',
  description:
    'Every model in the curated catalog: 20 open-weight LLMs across Meta, Alibaba, Mistral, Microsoft, Google, DeepSeek, Cohere, IBM, BigCode, and 01.AI.',
  alternates: {
    types: { 'text/agent-view': '/model/index.agent' },
  },
};

export const dynamic = 'force-static';

// Stable family display order. Largest catalogs first.
const FAMILY_ORDER: ModelFamily[] = [
  'Meta',
  'Alibaba',
  'OpenAI',
  'Mistral',
  'Microsoft',
  'Google',
  'DeepSeek',
  '01.AI',
  'Cohere',
  'IBM',
  'BigCode',
];

export default function ModelIndexPage() {
  const groups = FAMILY_ORDER.map((family) => ({
    family,
    models: MODELS.filter((m) => m.family === family),
  })).filter((g) => g.models.length > 0);

  return (
    <>
      <Nav active="models" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>model</span>
          </div>
          <h1>Models</h1>
          <p className="summary">
            Every model in the curated catalog. Click a card for the GPU
            recommendation matrix across quants and the Hugging Face link.
          </p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">Total</div>
              <div className="v tnum">
                {MODELS.length}
                <span className="unit">models</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Families</div>
              <div className="v tnum">
                {groups.length}
                <span className="unit">groups</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Smallest</div>
              <div className="v tnum">
                {Math.min(...MODELS.map((m) => m.params))}
                <span className="unit">B</span>
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Largest</div>
              <div className="v tnum">
                {Math.max(...MODELS.map((m) => m.params))}
                <span className="unit">B</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-jump">
        <div className="container">
          <div className="quick-jump-strip" role="navigation" aria-label="Jump to model family">
            <span className="quick-jump-label">{'// '}jump to</span>
            {groups.map(({ family, models }) => (
              <a key={family} href={`#family-${family.replace(/[^a-zA-Z0-9]/g, '-')}`} className="quick-jump-chip">
                {family}
                <span className="quick-jump-count">{models.length}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {groups.map(({ family, models }) => (
        <section key={family} id={`family-${family.replace(/[^a-zA-Z0-9]/g, '-')}`} style={{ scrollMarginTop: 80 }}>
          <div className="container">
            <div className="section-head">
              <h2>{family}</h2>
              <div className="right">
                {models.length} model{models.length === 1 ? '' : 's'}
              </div>
            </div>
            <div
              className="gpu-grid"
              style={{ border: '1px solid var(--line)', marginBottom: 32 }}
            >
              {models.map((m) => (
                <Link
                  key={m.slug}
                  href={`/model/${m.slug}/`}
                  className="gpu-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="badge">
                    {m.type === 'moe' ? `MoE · ${m.contextK}K ctx` : `${m.contextK}K ctx`}
                  </div>
                  <div className="name">{m.name}</div>
                  <div className="vram tnum">
                    {m.params}
                    <span className="unit">B</span>
                  </div>
                  <span className="gpu-card-link">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      <Footer route="/model" />
    </>
  );
}
