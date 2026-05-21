import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import GiscusComments from '@/components/GiscusComments';
import GlossaryTooltip from '@/components/GlossaryTooltip';

export const metadata: Metadata = {
  title: 'Learn',
  description:
    'A guided tour from zero to running an LLM locally. Five short chapters: parameters, bits, KV cache, picking hardware, picking a runtime. Built for newcomers.',
  alternates: {
    types: { 'text/agent-view': '/learn.agent' },
  },
};

export const dynamic = 'force-static';

interface Chapter {
  num: string;
  title: string;
  oneLiner: string;
  anchor: string;
}

const CHAPTERS: Chapter[] = [
  { num: '01', title: 'Parameters', oneLiner: 'What the numbers in a model name mean.', anchor: 'parameters' },
  { num: '02', title: 'Bits', oneLiner: 'Why 4 vs 8 vs 16 actually matters.', anchor: 'bits' },
  { num: '03', title: 'KV cache', oneLiner: 'The silent VRAM killer.', anchor: 'kv-cache' },
  { num: '04', title: 'Picking hardware', oneLiner: 'GPU, Apple Silicon, or rent the cloud.', anchor: 'hardware' },
  { num: '05', title: 'Picking a runtime', oneLiner: 'Ollama, LM Studio, vLLM, or MLX.', anchor: 'runtime' },
  { num: '06', title: 'Putting it together', oneLiner: 'Your first model on your hardware.', anchor: 'together' },
];

export default function LearnPage() {
  return (
    <>
      <Nav active="math" />

      <article className="article" style={{ maxWidth: 760 }}>
        <div className="kicker">$ /learn · zero to first model · 12 min read</div>
        <h1>Learn.</h1>
        <p className="lede">
          You&apos;ve heard about running LLMs locally. You&apos;re tired of
          paying per token. You don&apos;t know where to start. This is six
          short chapters that take you from zero to your first model running on
          your own hardware. No prior ML required.
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
            $ ls chapters/
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CHAPTERS.map((c) => (
              <a
                key={c.anchor}
                href={`#${c.anchor}`}
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 14,
                  color: 'var(--text)',
                  textDecoration: 'none',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'baseline',
                }}
              >
                <span style={{ color: 'var(--text-faint)' }}>{c.num}</span>
                <span style={{ minWidth: 180 }}>{c.title}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>{c.oneLiner}</span>
              </a>
            ))}
          </div>
        </section>

        <h2 id="parameters">
          <span className="num">01</span> Parameters
        </h2>

        <p>
          A model name like &quot;Llama 3.3 70B&quot; or &quot;Phi-4 14.7B&quot;
          contains the most important piece of information about the model:
          the number after the name is the count of{' '}
          <GlossaryTooltip slug="parameters">parameters</GlossaryTooltip>,
          measured in billions.
        </p>
        <p>
          Parameters are the learned values inside the neural network: the
          numbers that got tuned during training. More parameters generally
          means more capacity (smarter answers, better long-context behavior),
          but the relationship is non-linear and depends heavily on training
          data and architecture.
        </p>
        <p>
          For memory math, parameters are the first input. Everything else
          follows.
        </p>
        <div className="callout">
          <div className="label">Try this</div>
          <p style={{ margin: 0, fontSize: 15 }}>
            Open{' '}
            <Link href="/model/" style={{ color: 'var(--accent)' }}>
              the model catalog
            </Link>
            . Scan the family-grouped cards. Notice the param counts: 1B (edge),
            7-8B (workstation), 30-70B (serious), 405B+ (multi-GPU territory).
          </p>
        </div>

        <h2 id="bits">
          <span className="num">02</span> Bits
        </h2>
        <p>
          Each parameter has to be stored somewhere. The natural format is a
          floating-point number with 16 bits of precision (FP16). 16 bits = 2
          bytes. So a 70B-parameter model at FP16 takes <b>70 × 2 = 140 GB</b>{' '}
          of memory just for the weights.
        </p>
        <p>
          But you can store each parameter with fewer bits, accepting a small
          quality loss in exchange. This is called{' '}
          <GlossaryTooltip slug="quantization">quantization</GlossaryTooltip>.
          The most common compression points:
        </p>
        <div className="callout">
          <div className="label">Llama 3.3 70B at each quant</div>
          <div className="formula">
            FP16 (reference) <span className="op">→</span> 140 GB <br />
            FP8 / INT8 (near-lossless) <span className="op">→</span> 70 GB <br />
            Q5_K_M (very small loss) <span className="op">→</span> 48 GB <br />
            Q4_K_M (production floor) <span className="op">→</span> 39 GB <br />
            Q3_K_M (visible loss) <span className="op">→</span> 30 GB
          </div>
        </div>
        <p>
          The formula is just <b>params × bits ÷ 8 = gigabytes</b>. That&apos;s
          the whole thesis of this site. Read{' '}
          <Link href="/the-math" style={{ color: 'var(--accent)' }}>
            /the-math
          </Link>{' '}
          if you want the full derivation.
        </p>
        <div className="callout">
          <div className="label">Try this</div>
          <p style={{ margin: 0, fontSize: 15 }}>
            Open the{' '}
            <Link href="/calc/?tab=size" style={{ color: 'var(--accent)' }}>
              calculator&apos;s By-size tab
            </Link>
            . Drag the params slider to 70. See the 9-quant grid update. That
            grid is this formula, rendered live.
          </p>
        </div>

        <h2 id="kv-cache">
          <span className="num">03</span> KV cache
        </h2>
        <p>
          The model needs to remember the previous tokens in the conversation.
          That memory is called the{' '}
          <GlossaryTooltip slug="kv-cache">KV cache</GlossaryTooltip>.
          It grows linearly with the length of the conversation (the{' '}
          <GlossaryTooltip slug="context-window">context window</GlossaryTooltip>
          ) and with how many parallel requests you serve (
          <GlossaryTooltip slug="concurrency">concurrency</GlossaryTooltip>).
        </p>
        <p>
          At a normal chat length (a few thousand tokens, one request at a time)
          the KV cache is small. At 32K context with 4 concurrent users, it
          can be larger than the model weights themselves. This is the line
          item that catches people off guard.
        </p>
        <p>
          Plus the runtime itself reserves some memory (
          <GlossaryTooltip slug="framework-overhead">framework overhead</GlossaryTooltip>
          ), and a sensible{' '}
          <GlossaryTooltip slug="safety-headroom">safety headroom</GlossaryTooltip>{' '}
          buffer against fragmentation. The full equation is:
        </p>
        <div className="callout">
          <div className="label">What&apos;s actually left for weights</div>
          <div className="formula">
            <span className="op">budget</span> = <br />
            &nbsp;&nbsp;total_vram <span className="op">×</span> (1 − safety)<br />
            &nbsp;&nbsp;<span className="op">−</span> kv_cache <span className="op">×</span> concurrency<br />
            &nbsp;&nbsp;<span className="op">−</span> framework_overhead
          </div>
        </div>
        <p>
          That&apos;s the entire calculator. Three subtractions and one
          multiplication.
        </p>

        <h2 id="hardware">
          <span className="num">04</span> Picking hardware
        </h2>
        <p>
          Three real options for running LLMs at home:
        </p>
        <p>
          <b>Consumer NVIDIA GPU.</b> RTX 3090/4090/5090, 24-32 GB of VRAM. The
          mainstream answer. Best price-to-performance for single-user
          workflows. Cap out around the 70B class at Q3-Q4 quants.
        </p>
        <p>
          <b>Apple Silicon Mac.</b> M2/M3/M4/M5 Max or Ultra, 64-512 GB of
          unified memory. The unified memory model means the GPU has access to
          the entire system RAM. Single Mac Studio runs models that would need
          multi-GPU rigs on NVIDIA. Slower per-token than equivalent NVIDIA
          (less compute, less memory bandwidth), but the memory ceiling is
          much higher.
        </p>
        <p>
          <b>Datacenter / workstation.</b> A6000, RTX 6000 Ada, H100, B200,
          MI300X. Expensive (US$ 4k-30k+ per card). Only worth it if you&apos;re
          building serving infrastructure for many users, or you need 405B+
          quality at FP16.
        </p>
        <div className="callout">
          <div className="label">Try this</div>
          <p style={{ margin: 0, fontSize: 15 }}>
            Open{' '}
            <Link href="/gpu/" style={{ color: 'var(--accent)' }}>
              the GPU catalog
            </Link>
            . Click a card you&apos;re considering buying. See the per-card
            calculator and the fit table of which models actually run on it.
          </p>
        </div>

        <h2 id="runtime">
          <span className="num">05</span> Picking a runtime
        </h2>
        <p>
          A runtime is the program that actually loads the model and serves
          inference. The mainstream open-source options:
        </p>
        <p>
          <b>
            <Link href="/runtime/ollama" style={{ color: 'var(--accent)' }}>
              Ollama
            </Link>
          </b>{' '}
          — the easiest start. Single-binary CLI, model registry. Run{' '}
          <code style={{ fontFamily: 'var(--mono)' }}>ollama run llama3.3</code>{' '}
          and you&apos;re done. Cross-platform.
        </p>
        <p>
          <b>
            <Link href="/runtime/lm-studio" style={{ color: 'var(--accent)' }}>
              LM Studio
            </Link>
          </b>{' '}
          — the easiest GUI. Browse and download models in-app, chat in a
          window. Mac, Windows, Linux.
        </p>
        <p>
          <b>
            <Link href="/runtime/vllm" style={{ color: 'var(--accent)' }}>
              vLLM
            </Link>
          </b>{' '}
          — production-grade. PagedAttention, continuous batching,
          OpenAI-compatible API. What real serving infra is built on. Heavier
          setup than Ollama.
        </p>
        <p>
          <b>
            <Link href="/runtime/omlx" style={{ color: 'var(--accent)' }}>
              oMLX
            </Link>
          </b>{' '}
          — the Apple-native answer. Built on{' '}
          <Link href="/runtime/mlx" style={{ color: 'var(--accent)' }}>
            MLX
          </Link>
          , Apple&apos;s array framework. Paged SSD KV cache means coding
          agents (Claude Code, Cursor) get sub-5s TTFT after the first turn.
          Mac-only.
        </p>

        <h2 id="together">
          <span className="num">06</span> Putting it together
        </h2>
        <p>
          You have everything. Pick a target model. Look up its size at the
          quant you want. Subtract overhead and KV cache. Compare to your
          hardware&apos;s budget. If it fits, install a runtime, pull the
          model, and chat.
        </p>
        <p>The shortest path:</p>
        <ol style={{ fontSize: 15, lineHeight: 1.7 }}>
          <li>
            Pick a model from{' '}
            <Link href="/model/" style={{ color: 'var(--accent)' }}>
              /model
            </Link>
            . If you&apos;re unsure, start with Llama 3.1 8B (works on almost
            anything) or Qwen 2.5 7B.
          </li>
          <li>
            Check{' '}
            <Link href="/can-i-run/llama-3-1-8b" style={{ color: 'var(--accent)' }}>
              /can-i-run/llama-3-1-8b
            </Link>{' '}
            (or your chosen model) to confirm what fits.
          </li>
          <li>
            Install{' '}
            <Link href="/runtime/ollama" style={{ color: 'var(--accent)' }}>
              Ollama
            </Link>{' '}
            (
            <code style={{ fontFamily: 'var(--mono)' }}>
              curl -fsSL https://ollama.com/install.sh | sh
            </code>
            ) or download{' '}
            <Link href="/runtime/lm-studio" style={{ color: 'var(--accent)' }}>
              LM Studio
            </Link>
            .
          </li>
          <li>
            Run{' '}
            <code style={{ fontFamily: 'var(--mono)' }}>
              ollama run llama3.1:8b
            </code>
            . Or in LM Studio: search, download, load, chat.
          </li>
          <li>
            Open the{' '}
            <Link href="/calc" style={{ color: 'var(--accent)' }}>
              calculator
            </Link>{' '}
            and tune the sliders to match your real workload (context length,
            concurrency). Share the URL with friends running similar hardware.
          </li>
        </ol>

        <div
          style={{
            marginTop: 64,
            padding: '24px 28px',
            border: '1px solid var(--accent-line)',
            backgroundColor: 'rgba(255, 169, 71, 0.04)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            $ done. now what?
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
            You can compute your budget, you can pick hardware, you can pick a
            runtime, you can run a model. The rest is operational stuff:
            quantization tradeoffs, tool calling, prompt engineering, multi-GPU
            setups. None of it is gatekept. The math you just learned is the
            foundation; everything else is patterns built on top.
          </p>
          <p
            style={{
              margin: '14px 0 0',
              fontFamily: 'var(--mono)',
              fontSize: 13,
              color: 'var(--text-dim)',
            }}
          >
            $ next:{' '}
            <Link href="/calc" style={{ color: 'var(--accent)' }}>
              open the calculator →
            </Link>
            {' · '}
            <Link href="/glossary" style={{ color: 'var(--accent)' }}>
              browse the glossary →
            </Link>
          </p>
        </div>
      </article>

      <GiscusComments category="General" />

      <Footer route="/learn" />
    </>
  );
}
