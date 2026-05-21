// calculator.jsx — vrambudget interactive calculator shell
// Math is intentionally placeholder; see TODO markers — wire to lib/vram.ts in prod.

const { useState, useMemo, useEffect } = React;

// ───────────────────────────────────────────────────────────────────────────
// data
// ───────────────────────────────────────────────────────────────────────────

const GPUS = [
  // ── nvidia rtx 30 series ────────────────────────────────────────────
  { slug: "rtx-3060",      name: "RTX 3060 12GB",  vram: 12,  category: "rtx-30",   badge: "ampere" },
  { slug: "rtx-3070",      name: "RTX 3070",       vram: 8,   category: "rtx-30",   badge: "ampere" },
  { slug: "rtx-3080",      name: "RTX 3080",       vram: 10,  category: "rtx-30",   badge: "ampere" },
  { slug: "rtx-3080-ti",   name: "RTX 3080 Ti",    vram: 12,  category: "rtx-30",   badge: "ampere" },
  { slug: "rtx-3090",      name: "RTX 3090",       vram: 24,  category: "rtx-30",   badge: "ampere" },
  { slug: "rtx-3090-ti",   name: "RTX 3090 Ti",    vram: 24,  category: "rtx-30",   badge: "ampere" },

  // ── nvidia rtx 40 series ────────────────────────────────────────────
  { slug: "rtx-4060",      name: "RTX 4060",         vram: 8,   category: "rtx-40", badge: "ada" },
  { slug: "rtx-4060-ti",   name: "RTX 4060 Ti 16",   vram: 16,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4070",      name: "RTX 4070",         vram: 12,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4070-s",    name: "RTX 4070 Super",   vram: 12,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4070-ti-s", name: "RTX 4070 Ti Super",vram: 16,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4080",      name: "RTX 4080",         vram: 16,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4080-s",    name: "RTX 4080 Super",   vram: 16,  category: "rtx-40", badge: "ada" },
  { slug: "rtx-4090",      name: "RTX 4090",         vram: 24,  category: "rtx-40", badge: "ada · flagship" },

  // ── nvidia rtx 50 series ────────────────────────────────────────────
  { slug: "rtx-5070",      name: "RTX 5070",       vram: 12,  category: "rtx-50",   badge: "blackwell" },
  { slug: "rtx-5070-ti",   name: "RTX 5070 Ti",    vram: 16,  category: "rtx-50",   badge: "blackwell" },
  { slug: "rtx-5080",      name: "RTX 5080",       vram: 16,  category: "rtx-50",   badge: "blackwell" },
  { slug: "rtx-5090",      name: "RTX 5090",       vram: 32,  category: "rtx-50",   badge: "blackwell · flagship" },

  // ── apple silicon ───────────────────────────────────────────────────
  { slug: "m2-max-64",     name: "M2 Max 64",      vram: 64,  category: "apple",    badge: "apple" },
  { slug: "m2-ultra-192",  name: "M2 Ultra 192",   vram: 192, category: "apple",    badge: "apple" },
  { slug: "m3-max-64",     name: "M3 Max 64",      vram: 64,  category: "apple",    badge: "apple" },
  { slug: "m3-max-96",     name: "M3 Max 96",      vram: 96,  category: "apple",    badge: "apple" },
  { slug: "m4-pro-64",     name: "M4 Pro 64",      vram: 64,  category: "apple",    badge: "apple" },
  { slug: "m4-max-128",    name: "M4 Max 128",     vram: 128, category: "apple",    badge: "apple" },
  { slug: "m3-ultra-512",  name: "M3 Ultra 512",   vram: 512, category: "apple",    badge: "apple · monster" },

  // ── workstation ─────────────────────────────────────────────────────
  { slug: "a6000",         name: "RTX A6000",         vram: 48,  category: "workstation", badge: "ampere · 48GB" },
  { slug: "rtx-6000-ada",  name: "RTX 6000 Ada",      vram: 48,  category: "workstation", badge: "ada · 48GB" },
  { slug: "rtx-6000-pro",  name: "RTX Pro 6000",      vram: 96,  category: "workstation", badge: "blackwell · 96GB" },
  { slug: "l40s",          name: "L40S",              vram: 48,  category: "workstation", badge: "ada · datacenter" },

  // ── datacenter / blackwell ──────────────────────────────────────────
  { slug: "h100",          name: "H100 80GB",      vram: 80,  category: "datacenter", badge: "hopper" },
  { slug: "h200",          name: "H200",           vram: 141, category: "datacenter", badge: "hopper" },
  { slug: "b200",          name: "B200",           vram: 192, category: "datacenter", badge: "blackwell" },
  { slug: "dgx-spark",     name: "DGX Spark",      vram: 128, category: "datacenter", badge: "grace blackwell" },
  { slug: "h100-nvl-2x",   name: "2× H100 NVL",    vram: 188, category: "datacenter", badge: "multi-gpu" },

  // ── amd ─────────────────────────────────────────────────────────────
  { slug: "rx-7900-xtx",   name: "RX 7900 XTX",      vram: 24,  category: "amd",      badge: "rdna3" },
  { slug: "w7900",         name: "Radeon Pro W7900", vram: 48,  category: "amd",      badge: "rdna3 · workstation" },
  { slug: "mi300x",        name: "MI300X",           vram: 192, category: "amd",      badge: "cdna3 · datacenter" },

  // ── intel ───────────────────────────────────────────────────────────
  { slug: "arc-b580",      name: "Arc B580",       vram: 12,  category: "intel",    badge: "battlemage" },
  { slug: "arc-pro-b60",   name: "Arc Pro B60",    vram: 24,  category: "intel",    badge: "battlemage · pro" },
  { slug: "gaudi-3",       name: "Gaudi 3",        vram: 128, category: "intel",    badge: "datacenter" },
];

const GPU_CATEGORIES = [
  { id: "rtx-50",       label: "RTX 50",        sub: "Blackwell" },
  { id: "rtx-40",       label: "RTX 40",        sub: "Ada Lovelace" },
  { id: "rtx-30",       label: "RTX 30",        sub: "Ampere" },
  { id: "apple",        label: "Apple Silicon", sub: "M2 · M3 · M4" },
  { id: "workstation",  label: "Workstation",   sub: "A6000 · 6000 Ada · Pro 6000" },
  { id: "datacenter",   label: "Datacenter",    sub: "H100 · H200 · B200" },
  { id: "amd",          label: "AMD",           sub: "Radeon · Instinct" },
  { id: "intel",        label: "Intel",         sub: "Arc · Gaudi" },
];

const QUANTS = [
  { id: "FP16",  bits: 16,   label: "FP16" },
  { id: "FP8",   bits: 8,    label: "FP8"  },
  { id: "Q8_0",  bits: 8.5,  label: "Q8_0" },
  { id: "Q6_K",  bits: 6.5,  label: "Q6_K" },
  { id: "Q5_K_M",bits: 5.5,  label: "Q5_K_M" },
  { id: "Q4_K_M",bits: 4.5,  label: "Q4_K_M" },
  { id: "Q3_K_M",bits: 3.5,  label: "Q3_K_M" },
  { id: "AWQ",   bits: 4,    label: "AWQ"   },
  { id: "GPTQ",  bits: 4,    label: "GPTQ"  },
];

const MODELS = [
  { name: "Llama 3.1 8B",       params: 8,    family: "Meta" },
  { name: "Llama 3.1 70B",      params: 70,   family: "Meta" },
  { name: "Llama 3.1 405B",     params: 405,  family: "Meta" },
  { name: "Qwen 2.5 7B",        params: 7,    family: "Alibaba" },
  { name: "Qwen 2.5 32B",       params: 32,   family: "Alibaba" },
  { name: "Qwen 2.5 72B",       params: 72,   family: "Alibaba" },
  { name: "Mistral 7B v0.3",    params: 7.2,  family: "Mistral" },
  { name: "Mixtral 8x7B",       params: 46.7, family: "Mistral" },
  { name: "Mixtral 8x22B",      params: 141,  family: "Mistral" },
  { name: "Phi-3 Mini",         params: 3.8,  family: "Microsoft" },
  { name: "Phi-3 Medium",       params: 14,   family: "Microsoft" },
  { name: "Gemma 2 9B",         params: 9,    family: "Google" },
  { name: "Gemma 2 27B",        params: 27,   family: "Google" },
  { name: "DeepSeek-V2.5",      params: 236,  family: "DeepSeek" },
  { name: "DeepSeek Coder 33B", params: 33,   family: "DeepSeek" },
  { name: "Yi 34B",             params: 34,   family: "01.AI" },
  { name: "Command R+",         params: 104,  family: "Cohere" },
  { name: "Granite 8B Code",    params: 8,    family: "IBM" },
  { name: "StarCoder2 15B",     params: 15,   family: "BigCode" },
  { name: "WizardLM 2 7B",      params: 7,    family: "Microsoft" },
];

// ───────────────────────────────────────────────────────────────────────────
// math — PLACEHOLDER. TODO: replace with lib/vram.ts
// ───────────────────────────────────────────────────────────────────────────

// Weight size: params (B) × bits / 8 = GB. The thesis formula.
function weightsGB(params, bits) {
  return (params * bits) / 8;
}

// KV cache placeholder: scales w/ context, concurrency, and rough layer count.
// TODO: wire to kvCacheGB(params, context, concurrency) in lib/vram.ts
function kvCacheGB(params, context, concurrency) {
  // crude approximation: ~ params^0.5 × context/1000 × concurrency × 0.04
  const layers = 8 + Math.log2(Math.max(params, 1)) * 6;
  return Math.max(0.2, (layers * context * concurrency) / 1e6 * 0.5);
}

// Framework overhead: CUDA ctx, kernels, allocator slack. TODO: lib/vram.ts
function frameworkOverheadGB(totalVram) {
  return 1.2 + totalVram * 0.04;
}

function weightsBudgetGB(totalVram, kv, overhead, safetyPct) {
  return Math.max(0, totalVram * (1 - safetyPct / 100) - kv - overhead);
}

function classifyFit(weights, budget) {
  if (weights <= budget * 0.9) return "fits";
  if (weights <= budget) return "tight";
  return "over";
}

const fmtGB = (n) => {
  if (n < 1) return n.toFixed(2);
  if (n < 10) return n.toFixed(1);
  return Math.round(n).toString();
};

// ───────────────────────────────────────────────────────────────────────────
// components
// ───────────────────────────────────────────────────────────────────────────

function GpuGrid({ selected, onSelect }) {
  // pick the category that contains the selected GPU as initial tab
  const selectedGpu = GPUS.find((g) => g.slug === selected);
  const [cat, setCat] = useState(selectedGpu ? selectedGpu.category : "rtx-40");
  const gpus = GPUS.filter((g) => g.category === cat);

  return (
    <div data-screen-label="gpu-grid">
      {/* category strip */}
      <div className="gpu-cats" role="tablist" aria-label="GPU family">
        {GPU_CATEGORIES.map((c) => {
          const count = GPUS.filter((g) => g.category === c.id).length;
          return (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              className={"gpu-cat" + (cat === c.id ? " active" : "")}
              onClick={() => setCat(c.id)}
            >
              <span className="gc-label">{c.label}</span>
              <span className="gc-sub">{c.sub}</span>
              <span className="gc-count">[{count}]</span>
            </button>
          );
        })}
      </div>

      {/* card grid for active category */}
      <div className="gpu-grid">
        {gpus.map((g) => {
          // detect if we're already on a /gpu/<slug>.html page; relative link differs
          const onGpuPage = typeof window !== 'undefined' && window.location.pathname.includes('/gpu/');
          const detailHref = onGpuPage ? `${g.slug}.html` : `gpu/${g.slug}.html`;
          return (
            <div
              key={g.slug}
              className={"gpu-card" + (selected === g.slug ? " active" : "")}
              onClick={() => onSelect(g)}
              role="button"
              tabIndex={0}
            >
              <div className="badge">{g.badge}</div>
              <div className="name">{g.name}</div>
              <div className="vram tnum">{g.vram}<span className="unit">GB</span></div>
              <a
                className="gpu-card-link"
                href={detailHref}
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${g.name} detail page`}
                title="View full page"
              >↗</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange, format }) {
  return (
    <div className="slider-row">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-label={label}
      />
      <div className="val">
        {format ? format(value) : value}
        {unit && <span className="unit">{unit}</span>}
      </div>
    </div>
  );
}

function Tiles({ total, kv, overhead, budget }) {
  return (
    <div className="tiles">
      <div className="tile">
        <div className="lbl"><span className="dash">01</span> Total VRAM</div>
        <div className="num tnum">{fmtGB(total)}<span className="unit">GB</span></div>
        <div className="pct">device capacity</div>
      </div>
      <div className="tile">
        <div className="lbl"><span className="dash">02</span> KV cache</div>
        <div className="num tnum">{fmtGB(kv)}<span className="unit">GB</span></div>
        <div className="pct">{((kv / total) * 100).toFixed(1)}% of total</div>
      </div>
      <div className="tile">
        <div className="lbl"><span className="dash">03</span> Runtime overhead</div>
        <div className="num tnum">{fmtGB(overhead)}<span className="unit">GB</span></div>
        <div className="pct">{((overhead / total) * 100).toFixed(1)}% of total</div>
      </div>
      <div className="tile accent">
        <div className="lbl"><span className="dash">04</span> Weights budget</div>
        <div className="num tnum">{fmtGB(budget)}<span className="unit">GB</span></div>
        <div className="pct">{((budget / total) * 100).toFixed(0)}% of total</div>
      </div>
    </div>
  );
}

function BudgetBar({ total, kv, overhead, safety, weightsUsed }) {
  const safetyGB = total * (safety / 100);
  const weightsPct = Math.min(100, (weightsUsed / total) * 100);
  const kvPct = (kv / total) * 100;
  const overheadPct = (overhead / total) * 100;
  const safetyPct = (safetyGB / total) * 100;
  return (
    <div className="budget-bar">
      <div className="row">
        <span>$ budget allocation</span>
        <span className="right tnum">{fmtGB(weightsUsed + kv + overhead)} / {fmtGB(total)} GB used</span>
      </div>
      <div className="bar">
        <div className="seg-weights" style={{ width: weightsPct + "%" }} title="weights" />
        <div className="seg-kv" style={{ width: kvPct + "%" }} title="kv cache" />
        <div className="seg-overhead" style={{ width: overheadPct + "%" }} title="overhead" />
        <div className="seg-safety" style={{ width: safetyPct + "%" }} title="safety headroom" />
      </div>
      <div className="bar-legend">
        <span><span className="sw" style={{background:"var(--accent)"}} />weights</span>
        <span><span className="sw" style={{background:"rgba(255,169,71,0.55)"}} />kv cache</span>
        <span><span className="sw" style={{background:"rgba(255,169,71,0.28)"}} />overhead</span>
        <span><span className="sw" style={{background:"rgba(255,255,255,0.06)", border: "1px solid var(--line-strong)"}} />safety</span>
      </div>
    </div>
  );
}

function CuratedList({ budget }) {
  // pick a sensible quant per model: the largest one that fits the budget,
  // falling back to Q4_K_M if nothing fits.
  const rows = MODELS.map((m) => {
    const candidates = QUANTS.map((q) => ({
      q,
      size: weightsGB(m.params, q.bits),
    }));
    let best = candidates.find((c) => c.size <= budget);
    if (!best) best = candidates[candidates.length - 4]; // Q4_K_M
    const fit = classifyFit(best.size, budget);
    return { m, best, candidates, fit };
  });

  // float fits → tight → over; within each group, largest model first
  // (so the "this is what your hardware can do" answer sits at the top)
  const order = { fits: 0, tight: 1, over: 2 };
  const sorted = rows.slice().sort((a, b) => {
    if (order[a.fit] !== order[b.fit]) return order[a.fit] - order[b.fit];
    if (a.fit === "over") return a.m.params - b.m.params;  // smallest first for over (most achievable)
    return b.m.params - a.m.params;                         // largest first for fits/tight
  });

  // group markers
  const groups = ["fits", "tight", "over"];
  const grouped = groups
    .map((g) => ({ key: g, items: sorted.filter((r) => r.fit === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="model-list">
      {grouped.map((g) => (
        <React.Fragment key={g.key}>
          <div className="model-group-head">
            <span className={"pill " + g.key}>{g.key}</span>
            <span className="g-label">
              {g.key === "fits"  && "comfortably runs on this budget"}
              {g.key === "tight" && "runs at default context — watch concurrency"}
              {g.key === "over"  && "needs a bigger card, more aggressive quant, or model split"}
            </span>
            <span className="g-count tnum">{g.items.length} model{g.items.length !== 1 ? "s" : ""}</span>
          </div>
          {g.items.map(({ m, best, candidates, fit }) => (
            <div className="model-row" key={m.name}>
              <div className="m-name">
                {m.name}
                <span className="params tnum">{m.params}B</span>
              </div>
              <div className="m-pills">
                {candidates.map((c) => (
                  <span
                    key={c.q.id}
                    className={"pill" + (c.q.id === best.q.id ? " on" : "")}
                    title={`${c.q.label}: ${fmtGB(c.size)} GB`}
                  >
                    {c.q.label}
                  </span>
                ))}
              </div>
              <div className="m-size tnum">
                {fmtGB(best.size)}<span className="unit"> GB</span>
              </div>
              <div className="m-fit">
                <span className={"pill " + fit}>{fit}</span>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

function SearchPane({ budget }) {
  const [q, setQ] = useState("mixtral");
  const results = useMemo(() => {
    const m = MODELS.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    return m.slice(0, 6);
  }, [q]);
  return (
    <div className="search-pane">
      <div className="search-row">
        <div className="search-prefix">$</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search huggingface for a model name…"
          aria-label="search Hugging Face"
        />
        <button>search</button>
      </div>
      <div className="model-list" style={{ marginTop: 24, border: "1px solid var(--line)" }}>
        {results.map((m) => {
          const q4 = QUANTS.find((x) => x.id === "Q4_K_M");
          const sz = weightsGB(m.params, q4.bits);
          const fit = classifyFit(sz, budget);
          return (
            <div className="model-row" key={m.name}>
              <div className="m-name">{m.name} <span className="params tnum">{m.params}B</span></div>
              <div className="m-pills">
                <span className="pill on">Q4_K_M</span>
                <span className="pill" style={{ color: "var(--text-faint)" }}>↗ hf.co/{m.family.toLowerCase()}/{m.name.toLowerCase().replace(/\s+/g, "-")}</span>
              </div>
              <div className="m-size tnum">{fmtGB(sz)}<span className="unit"> GB</span></div>
              <div className="m-fit"><span className={"pill " + fit}>{fit}</span></div>
            </div>
          );
        })}
        {results.length === 0 && (
          <div style={{ padding: 24, fontFamily: "var(--mono)", color: "var(--text-faint)", fontSize: 13 }}>
            no results. TODO: wire to Hugging Face Hub API.
          </div>
        )}
      </div>
    </div>
  );
}

function BySizePane({ budget }) {
  const [params, setParams] = useState(13);
  const quants = QUANTS.slice(0, 9); // 3x3 = 9
  return (
    <div className="size-pane">
      <div className="size-controls">
        <label style={{fontFamily:"var(--mono)", fontSize:12, color:"var(--text-dim)", textTransform:"uppercase", letterSpacing:"0.04em"}}>Params</label>
        <input
          type="range"
          min={1}
          max={405}
          step={1}
          value={params}
          onChange={(e) => setParams(parseFloat(e.target.value))}
          aria-label="parameter count"
        />
        <div className="val mono tnum" style={{fontSize:14, textAlign:"right"}}>{params}<span className="unit"> B</span></div>
      </div>
      <div className="size-grid">
        {quants.map((q) => {
          const sz = weightsGB(params, q.bits);
          const fit = classifyFit(sz, budget);
          return (
            <div key={q.id} className={"size-cell " + fit}>
              <div className="quant">{q.label} <span style={{color:"var(--text-faint)"}}>· {q.bits} bit</span></div>
              <div className="gb tnum">{fmtGB(sz)}<span className="unit">GB</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// main calculator
// ───────────────────────────────────────────────────────────────────────────

function Calculator({ initialGpu }) {
  const [gpu, setGpu] = useState(GPUS.find((g) => g.slug === initialGpu) || GPUS[3]);
  const [vram, setVram] = useState(gpu.vram);
  const [sysRam, setSysRam] = useState(64);
  const [context, setContext] = useState(8192);
  const [concurrency, setConcurrency] = useState(1);
  const [safety, setSafety] = useState(15);
  const [tab, setTab] = useState("curated");

  // when GPU changes, snap VRAM
  useEffect(() => { setVram(gpu.vram); }, [gpu.slug]);

  // representative model size used for kv estimation (mid-range)
  const kv = kvCacheGB(13, context, concurrency);
  const overhead = frameworkOverheadGB(vram);
  const budget = weightsBudgetGB(vram, kv, overhead, safety);

  // for the budget bar, pretend weights fill the budget (so user sees the split)
  const weightsUsed = budget;

  return (
    <div className="calc" id="calculator" data-screen-label="calculator">
      <div className="calc-header">
        <span>$ vrambudget --gpu {gpu.slug} --ctx {context} --conc {concurrency} --safety {safety}%</span>
        <span className="dot-row">
          <span className="dot live" />
          <span>live</span>
        </span>
      </div>

      <GpuGrid selected={gpu.slug} onSelect={setGpu} />

      <div className="calc-body">
        <div className="sliders">
          <Slider label="VRAM" value={vram} min={4} max={192} step={1} unit="GB" onChange={setVram} />
          <Slider label="System RAM" value={sysRam} min={8} max={512} step={8} unit="GB" onChange={setSysRam} />
          <Slider label="Context" value={context} min={2048} max={131072} step={1024} unit="tok" onChange={setContext}
                  format={(v) => v >= 1024 ? (v/1024).toFixed(0) + "K" : v} />
          <Slider label="Concurrency" value={concurrency} min={1} max={16} step={1} unit="req" onChange={setConcurrency} />
          <Slider label="Safety headroom" value={safety} min={5} max={40} step={1} unit="%" onChange={setSafety} />
        </div>

        <div style={{display:"flex", flexDirection:"column"}}>
          <Tiles total={vram} kv={kv} overhead={overhead} budget={budget} />
        </div>
      </div>

      <BudgetBar total={vram} kv={kv} overhead={overhead} safety={safety} weightsUsed={weightsUsed} />

      <div className="tab-bar">
        <div className="tabs" role="tablist">
          <button className={"tab" + (tab === "curated" ? " active" : "")} onClick={() => setTab("curated")}>
            Curated picks <span className="count">[{MODELS.length}]</span>
          </button>
          <button className={"tab" + (tab === "search" ? " active" : "")} onClick={() => setTab("search")}>
            Search Hugging Face
          </button>
          <button className={"tab" + (tab === "size" ? " active" : "")} onClick={() => setTab("size")}>
            By size
          </button>
        </div>
        <div className="search-mini">
          {/* TODO: wire to lib/vram.ts → classifyFit() */}
          ↳ sorted by best fit
        </div>
      </div>

      {tab === "curated" && <CuratedList budget={budget} />}
      {tab === "search" && <SearchPane budget={budget} />}
      {tab === "size" && <BySizePane budget={budget} />}
    </div>
  );
}

// Expose globals for other scripts
Object.assign(window, {
  Calculator, GPUS, MODELS, QUANTS,
  weightsGB, kvCacheGB, frameworkOverheadGB, weightsBudgetGB, classifyFit, fmtGB,
});
