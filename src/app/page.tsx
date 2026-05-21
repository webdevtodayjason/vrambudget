import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Calculator from '@/components/Calculator';

export const metadata: Metadata = {
  title: 'vrambudget',
  description:
    'Plug in your GPU. See what actually fits. The math behind local LLM memory budgets.',
  alternates: { types: { 'text/agent-view': '/index.agent' } },
};

export const dynamic = 'force-static';

export default function HomePage() {
  return (
    <>
      <Nav active="calculator" />

      {/* ── hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid" id="hero-grid" data-comment-anchor="hero">
            <div className="eyebrow">
              honest math for local llms · open source · MIT
            </div>
            <h1 className="hero-headline">
              What LLM fits<br />my hardware<span className="q-mark">?</span>
            </h1>
            <div className="hero-answer-row">
              <span className="arrow">$ answer ↓</span>
              <span>the math, in one line</span>
            </div>
            <p className="hero-formula">
              VRAM <span className="approx">≈</span> params{' '}
              <span className="op">×</span> (bits <span className="op">÷</span>{' '}
              8)
            </p>
            <p className="hero-sub">
              Honest VRAM math for local LLMs.{' '}
              <span className="dim">
                KV cache, activations, framework overhead, and concurrency are
                what actually crash your runs. This site makes that visible.
              </span>
            </p>
            <div className="cta-row">
              <Link href="#calculator" className="btn btn-primary">
                <span>Run the math</span>
                <span className="caret">↓</span>
              </Link>
              <Link href="/the-math" className="btn">
                <span>Read the explainer</span>
                <span className="caret">→</span>
              </Link>
            </div>
            <div className="hero-meta">
              <span>
                <b>42</b> GPU presets
              </span>
              <span>
                <b>30</b> curated models
              </span>
              <span>
                <b>5</b> hosting runtimes
              </span>
              <span>
                <b>MIT</b> open source, no ads
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── calculator ───────────────────────────────────────────── */}
      <section id="calculator">
        <div className="container">
          <div className="section-head">
            <h2>Plug in your hardware. See what actually fits.</h2>
            <div className="right">$ ./vrambudget --interactive</div>
          </div>
          <Calculator />
        </div>
      </section>

      {/* ── the math, plainly ────────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="section-head">
            <h2>The math, plainly.</h2>
            <div className="right">$ cat the-math.md | head -20</div>
          </div>
          <div className="math-cols">
            <div className="math-col">
              <div className="step">01 / weights</div>
              <h3>Weight size is the floor, not the ceiling.</h3>
              <p>
                Every parameter occupies a fixed number of bits. Multiply,
                divide by eight, and you have gigabytes. Quantization is just a
                smaller multiplier. A 70B model at Q4_K_M is not magic; it is
                70 × 4.5 ÷ 8.
              </p>
              <pre className="code-block">
                <span className="c">{'// gigabytes of weights'}</span>
                {'\n'}
                <span className="k">weights</span>
                {' = '}
                <span className="v">params</span>
                {' × '}
                <span className="v">bits</span>
                {' ÷ '}
                <span className="v">8</span>
                {'\n\n'}
                <span className="c">{'// llama-3.1-70b @ Q4_K_M'}</span>
                {'\nweights = 70 × 4.5 ÷ 8\n        = '}
                <span className="v">39.4 GB</span>
              </pre>
            </div>

            <div className="math-col">
              <div className="step">02 / kv cache</div>
              <h3>The KV cache is what eats your context window.</h3>
              <p>
                Every token you generate writes a key and a value into every
                attention layer. Context length and concurrency both multiply
                it. This is why your 24GB card runs Llama 70B Q4 fine until you
                set ctx=32K and watch it OOM mid-generation.
              </p>
              <pre className="code-block">
                <span className="c">{'// per-request KV bytes'}</span>
                {'\n'}
                <span className="k">kv</span>
                {' = 2 × '}
                <span className="v">layers</span>
                {' × '}
                <span className="v">heads</span>
                {' ×\n     '}
                <span className="v">head_dim</span>
                {' × '}
                <span className="v">ctx</span>
                {' × '}
                <span className="v">bytes</span>
                {'\n\n'}
                <span className="c">{'// total at runtime'}</span>
                {'\ntotal = kv × '}
                <span className="v">concurrent_requests</span>
              </pre>
            </div>

            <div className="math-col">
              <div className="step">03 / overhead</div>
              <h3>Framework overhead is a constant tax.</h3>
              <p>
                CUDA context, kernel workspaces, allocator slack, paged-attention
                buffers. Roughly 1–2 GB on a cold load, plus 3–5% of the device.
                It is not optional. It is not optimizable. Budget for it.
              </p>
              <pre className="code-block">
                <span className="c">{'// rule of thumb'}</span>
                {'\n'}
                <span className="k">overhead</span>
                {' = '}
                <span className="v">1.5 GB</span>
                {' + '}
                <span className="v">total_vram</span>
                {' × '}
                <span className="v">0.04</span>
                {'\n\n'}
                <span className="c">{"// what's left for weights"}</span>
                {'\n'}
                <span className="k">budget</span>
                {' = total × (1 − safety)\n       − kv − overhead'}
              </pre>
            </div>
          </div>
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'var(--text-dim)',
              margin: '0 0 80px',
            }}
          >
            <Link href="/the-math" style={{ color: 'var(--accent)' }}>
              Read the full explainer →
            </Link>
          </p>
        </div>
      </section>

      {/* ── why this exists ──────────────────────────────────────── */}
      <section>
        <div className="container why">
          <div className="label section-label">why this exists</div>
          <div>
            <p>
              We run an MSP in Austin. Every week a client asks the same
              question:{' '}
              <span className="dim">{'"can my machine run this?"'}</span> Every
              benchmark site answers it with a vibes-based fit indicator and
              an affiliate link to a 4090. That&apos;s not a budget.
              That&apos;s marketing.
            </p>
            <p>
              So we built the thing we wished existed: the math, then the
              models.{' '}
              <span className="dim">
                No ranking algorithm. No SEO sludge. No surprise OOMs at 3am.
                Plug in your hardware, see the numbers, decide for yourself.
              </span>
            </p>
            <div className="signature">
              <span style={{ color: 'var(--text-faint)' }}>{'// built by'}</span>{' '}
              <a href="https://titaniumcomputing.com">Titanium Computing</a>{' '}
              <span style={{ color: 'var(--text-faint)' }}>
                · Austin, TX · Frontier Operations
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer route="/" />
    </>
  );
}
