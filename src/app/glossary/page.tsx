import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GiscusComments from '@/components/GiscusComments';
import { GLOSSARY, termBySlug } from '@/lib/glossary';

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'Plain-English definitions of every term you need to budget VRAM for local LLMs: KV cache, GQA, MoE, quantization, paged attention, TTFT, and the rest.',
  alternates: {
    types: { 'text/agent-view': '/glossary.agent' },
  },
};

export const dynamic = 'force-static';

export default function GlossaryPage() {
  return (
    <>
      <Nav active="math" />

      <article className="article" style={{ maxWidth: 820 }}>
        <div className="kicker">$ /glossary · {GLOSSARY.length} terms · last updated 2026-05-21</div>
        <h1>Glossary.</h1>
        <p className="lede">
          Plain-English definitions of the terms you keep running into when you
          read about local LLM inference. If a calculator slider or fit table
          here uses a word you don&apos;t know, this is where it lives.
        </p>

        <section
          aria-label="quick index"
          style={{
            marginBottom: 48,
            padding: '20px 24px',
            border: '1px solid var(--line)',
            backgroundColor: 'var(--bg-elev)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 14,
            }}
          >
            $ ls glossary/
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '8px 16px',
            }}
          >
            {GLOSSARY.map((t) => (
              <a
                key={t.slug}
                href={`#${t.slug}`}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--text)',
                  textDecoration: 'none',
                }}
              >
                ▸ {t.term}
              </a>
            ))}
          </div>
        </section>

        {GLOSSARY.map((t, idx) => (
          <section key={t.slug} id={t.slug} style={{ marginBottom: 56 }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                marginTop: 32,
              }}
            >
              <span className="num">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{t.term}</span>
            </h2>
            <p
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--text-dim)',
                margin: '4px 0 18px',
                lineHeight: 1.5,
              }}
            >
              {'// '}
              {t.oneLiner}
            </p>
            {t.definition.split('\n\n').map((para, pi) => (
              <p key={pi} style={{ whiteSpace: 'pre-wrap' }}>
                {para}
              </p>
            ))}
            {t.cite && (
              <p
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--text-faint)',
                  marginTop: 12,
                }}
              >
                {'// '}cite:{' '}
                <a
                  href={t.cite.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)' }}
                >
                  {t.cite.label} ↗
                </a>
              </p>
            )}
            {t.related.length > 0 && (
              <p
                style={{
                  marginTop: 16,
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                see also{' '}
                {t.related
                  .map((rs) => termBySlug(rs))
                  .filter(Boolean)
                  .map((r, i, arr) => (
                    <span key={r!.slug}>
                      <Link href={`#${r!.slug}`} style={{ color: 'var(--accent)' }}>
                        {r!.term}
                      </Link>
                      {i < arr.length - 1 && ' · '}
                    </span>
                  ))}
              </p>
            )}
          </section>
        ))}

        <p
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: '1px solid var(--line)',
            color: 'var(--text-dim)',
            fontFamily: 'var(--mono)',
            fontSize: 13,
          }}
        >
          <span style={{ color: 'var(--text-faint)' }}>{'// '}next:</span>{' '}
          <Link href="/the-math" style={{ color: 'var(--accent)' }}>
            $ read the math →
          </Link>
        </p>
      </article>

      <GiscusComments category="General" />

      <Footer route="/glossary" />
    </>
  );
}
