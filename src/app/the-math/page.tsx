import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'The math, plainly',
  description:
    'The full explainer: weights, KV cache, framework overhead, concurrency, and the VRAM tax nobody talks about.',
  alternates: { types: { 'text/agent-view': '/the-math.agent' } },
};

export const dynamic = 'force-static';

export default function TheMathPage() {
  return (
    <>
      <Nav active="math" />

      <article className="article">
        <div className="kicker">
          $ /the-math · 14 min read · last updated 2026-05-18
        </div>

        <h1>The math, plainly.</h1>

        <p className="lede">
          Most &quot;can my machine run this LLM&quot; tools list models and
          call it done. They show a green checkmark next to a 70B model on a
          24GB card and hope you don&apos;t ask why. This is the math they
          skipped.
        </p>

        <p>
          Every parameter in a transformer occupies a fixed number of bits in
          memory. Multiply them. Divide by eight. The result is gigabytes.
          That&apos;s the entire foundation. Every other line item — KV cache,
          activations, framework overhead, allocator slack — is just adding to
          a number you already had.
        </p>

        <div className="callout">
          <div className="label">The thesis, in one line</div>
          <div className="formula">
            <span className="op">VRAM</span> ≈ params{' '}
            <span className="op">×</span> (bits <span className="op">÷</span>{' '}
            8)
          </div>
        </div>

        <p>
          The rest of this article walks the additions. Skip to the section
          that&apos;s costing you the most.
        </p>

        <h2>
          <span className="num">01</span> Weight size: the floor
        </h2>

        <p>
          A 70-billion-parameter model loaded in 16-bit precision weighs{' '}
          <span className="dim">70 × 2 = 140 GB</span>. Loaded in 8-bit it
          weighs 70. In 4-bit, 35. The math doesn&apos;t care about the
          architecture, the training data, or the marketing copy.{' '}
          <span className="dim">
            It cares about two numbers: how many parameters, and how many bits
            each one occupies.
          </span>
        </p>

        <p>
          Quantization formats like Q4_K_M or AWQ are not exactly 4 bits per
          parameter — they carry small metadata overheads — but the rule of
          thumb (params × bits ÷ 8) is accurate to within a few percent. Treat
          it as gospel for napkin math and you&apos;ll be fine.
        </p>

        <div className="callout">
          <div className="label">Reference: Llama-3.1-70B</div>
          <div className="formula">
            FP16 <span className="op">→</span> 140 GB <br />
            Q8_0 <span className="op">→</span> 74.4 GB <br />
            Q5_K_M <span className="op">→</span> 48.1 GB <br />
            Q4_K_M <span className="op">→</span> 39.4 GB <br />
            Q3_K_M <span className="op">→</span> 30.6 GB
          </div>
        </div>

        <h2>
          <span className="num">02</span> KV cache: the context tax
        </h2>

        <p>
          Every token your model generates writes a key and a value into every
          attention layer. These accumulate. At ctx=2K nobody notices. At
          ctx=32K with concurrency 4, the KV cache{' '}
          <span className="dim">eats more VRAM than the weights</span>.
        </p>

        <p>
          The exact formula depends on the architecture (layers × heads × head
          dimension), but the practical version is:{' '}
          <span className="dim">
            budget 1–4 GB of KV per concurrent request at long context, on a
            70B-class model. More for larger models, less for smaller.
          </span>
        </p>

        <div className="callout">
          <div className="label">Per-request KV cache, bytes</div>
          <div className="formula">
            2 × layers × heads × head_dim × ctx × bytes_per_param
          </div>
        </div>

        <p>
          This is the single most under-counted line item in every &quot;fit
          check&quot; tool on the internet. If your tool doesn&apos;t ask you
          for context length, throw it out.
        </p>

        <h2>
          <span className="num">03</span> Framework overhead: the constant
        </h2>

        <p>
          CUDA context, kernel workspaces, paged-attention buffers, allocator
          fragmentation, the runtime itself. None of this shows up in the model
          card. All of it is real.
        </p>

        <p>
          Rule of thumb:{' '}
          <span className="dim">
            1.5 GB fixed, plus 3–5% of total device VRAM, depending on backend.
          </span>{' '}
          vLLM, llama.cpp, TGI, and exllamav2 each have their own constants. We
          use a generous middle estimate.
        </p>

        <div className="tax-box">
          <h3>$ THE VRAM TAX NOBODY TALKS ABOUT</h3>
          <div className="big">
            A 24 GB card does not give you 24 GB of weight budget.
          </div>
          <p style={{ color: 'var(--text-dim)', marginBottom: 18 }}>
            By the time you&apos;ve paid the runtime, the KV cache, and a sane
            safety margin, you have considerably less. Here is the bill on a
            stock RTX 4090 at ctx=8K, concurrency 1, 15% safety:
          </p>
          <ul>
            <li>
              <span className="pct">-3.6 GB</span> safety headroom (15% of 24)
            </li>
            <li>
              <span className="pct">-2.2 GB</span> framework overhead (1.5 + 4%
              of 24)
            </li>
            <li>
              <span className="pct">-0.8 GB</span> kv cache (ctx 8K, 1 req)
            </li>
            <li>
              <span className="pct">17.4 GB</span> ← what&apos;s actually left
              for weights
            </li>
          </ul>
        </div>

        <h2>
          <span className="num">04</span> Concurrency: the multiplier
        </h2>

        <p>
          Every concurrent request gets its own KV cache. Two requests, double
          the KV. Eight requests, eight times.{' '}
          <span className="dim">
            This is why production inference servers run smaller models than
            your local llama.cpp setup — they need the headroom for batching.
          </span>
        </p>

        <p>
          If you&apos;re serving one request at a time, ignore this. If
          you&apos;re building anything that fans out, this is the only number
          that matters.
        </p>

        <h2>
          <span className="num">05</span> The full equation
        </h2>

        <div className="callout">
          <div className="label">What&apos;s actually left for weights</div>
          <div className="formula">
            <span className="op">budget</span> = <br />
            &nbsp;&nbsp;total_vram <span className="op">×</span> (1 − safety)
            <br />
            &nbsp;&nbsp;<span className="op">−</span> kv_cache{' '}
            <span className="op">×</span> concurrency
            <br />
            &nbsp;&nbsp;<span className="op">−</span> framework_overhead
          </div>
        </div>

        <p>
          That&apos;s the calculator on the homepage. It&apos;s not magic.
          It&apos;s not a model. It&apos;s three subtractions and one
          multiplication. Anyone who tells you it needs to be more complicated
          is selling you something.
        </p>

        <h2>
          <span className="num">06</span> What this site doesn&apos;t do
        </h2>

        <p>
          It does not benchmark tokens-per-second. It does not predict accuracy
          degradation from quantization. It does not tell you which model to
          use.{' '}
          <span className="dim">
            There are good tools for those things. This one answers exactly
            one question: will the weights, the cache, and the runtime fit in
            your physical RAM. That&apos;s it. That&apos;s the whole product.
          </span>
        </p>

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
          <span style={{ color: 'var(--text-faint)' }}>{'// next:'}</span>{' '}
          <Link href="/#calculator" style={{ color: 'var(--accent)' }}>
            $ run the calculator →
          </Link>
        </p>
      </article>

      <Footer route="/the-math" />
    </>
  );
}
