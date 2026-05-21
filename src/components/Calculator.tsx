"use client";

// Calculator.tsx — vrambudget interactive calculator
// Ported from docs/handoff/project/calculator.jsx (reference only, do not import).
// All math + data comes from src/lib/*.

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  GPUS,
  GPU_CATEGORIES,
  gpuBySlug,
  type GPU,
  type GpuCategory,
} from "@/lib/gpus";
import {
  QUANTS,
  bestQuantForBudget,
  type Quant,
} from "@/lib/quants";
import { MODELS, type Model } from "@/lib/models";
import {
  weightsBudget,
  modelSizeGB,
  classifyFit,
  fmtGB,
  type Budget,
  type FitClass,
} from "@/lib/vram";
import {
  searchHF,
  inferParams,
  fmtDownloads,
  type HFSearchResult,
} from "@/lib/hf";
import {
  buildCalcQuery,
  readCalcUrl,
  type CalcTab,
} from "@/lib/calc-url";

// ────────────────────────────────────────────────────────────────────────────
// public surface
// ────────────────────────────────────────────────────────────────────────────

export interface CalculatorProps {
  /** Slug of the initially selected GPU. Defaults to `rtx-4090`. */
  initialGpu?: string;
  /** Initial context window in tokens. Defaults to 8192. */
  initialContext?: number;
  /** Initial concurrent-request count. Defaults to 1. */
  initialConcurrency?: number;
  /** Initial safety headroom percentage. Defaults to 15. */
  initialSafety?: number;
}

type Tab = CalcTab;

const FIT_ORDER: Record<FitClass, number> = { fits: 0, tight: 1, over: 2 };
const FIT_GROUPS: FitClass[] = ["fits", "tight", "over"];

const FIT_GROUP_COPY: Record<FitClass, string> = {
  fits: "comfortably runs on this budget",
  // Design copy retained verbatim (contains em dash by design contract).
  tight: "runs at default context — watch concurrency",
  over: "needs a bigger card, more aggressive quant, or model split",
};

// ────────────────────────────────────────────────────────────────────────────
// component
// ────────────────────────────────────────────────────────────────────────────

export default function Calculator({
  initialGpu = "rtx-4090",
  initialContext = 8192,
  initialConcurrency = 1,
  initialSafety = 15,
}: CalculatorProps) {
  const initialGpuObj: GPU = gpuBySlug(initialGpu) ?? GPUS[0];

  const [gpu, setGpu] = useState<GPU>(initialGpuObj);
  const [vram, setVram] = useState<number>(initialGpuObj.vramGB);
  const [sysRam, setSysRam] = useState<number>(64);
  const [context, setContext] = useState<number>(initialContext);
  const [concurrency, setConcurrency] = useState<number>(initialConcurrency);
  const [safety, setSafety] = useState<number>(initialSafety);
  const [tab, setTab] = useState<Tab>("curated");
  const [category, setCategory] = useState<GpuCategory>(initialGpuObj.category);
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const vramTouchedRef = useRef<boolean>(false);

  // Hydrate from URL on first client render. Static export means searchParams
  // isn't available SSR, so we read `window.location.search` directly post-mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const parsed = readCalcUrl(window.location.search);
    if (parsed.gpuSlug) {
      const next = gpuBySlug(parsed.gpuSlug);
      if (next) {
        setGpu(next);
        setCategory(next.category);
        if (parsed.vramOverride !== undefined) {
          setVram(parsed.vramOverride);
          vramTouchedRef.current = true;
        } else {
          setVram(next.vramGB);
        }
      }
    } else if (parsed.vramOverride !== undefined) {
      setVram(parsed.vramOverride);
      vramTouchedRef.current = true;
    }
    if (parsed.context !== undefined) setContext(parsed.context);
    if (parsed.concurrency !== undefined) setConcurrency(parsed.concurrency);
    if (parsed.safety !== undefined) setSafety(parsed.safety);
    if (parsed.tab !== undefined) setTab(parsed.tab);
    setHydrated(true);
  }, []);

  // when GPU selection changes, snap VRAM slider to the GPU's stock VRAM
  // (unless the user explicitly overrode it via URL or slider).
  useEffect(() => {
    if (!vramTouchedRef.current) {
      setVram(gpu.vramGB);
    }
  }, [gpu.slug, gpu.vramGB]);

  // Sync state to URL after hydration. Uses history.replaceState (no Next.js
  // navigation) so the URL updates without re-rendering the page.
  useEffect(() => {
    if (!hydrated) return;
    if (typeof window === "undefined") return;
    const query = buildCalcQuery(
      {
        gpuSlug: gpu.slug,
        vramOverride: vramTouchedRef.current ? vram : undefined,
        context,
        concurrency,
        safety,
        tab,
      },
      gpu.vramGB,
    );
    const nextUrl = `${window.location.pathname}${query}${window.location.hash}`;
    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [hydrated, gpu.slug, gpu.vramGB, vram, context, concurrency, safety, tab]);

  // Wrapped slider setters that mark VRAM as user-touched.
  const setVramTouched = (v: number) => {
    vramTouchedRef.current = true;
    setVram(v);
  };
  const setGpuAndResetVram = (next: GPU) => {
    vramTouchedRef.current = false;
    setGpu(next);
  };

  // Share button: copy current URL to clipboard.
  async function handleShare() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail in non-secure contexts; fall back to no-op.
      // Users on http://localhost in some browsers will hit this.
    }
  }

  const budget: Budget = useMemo(
    () =>
      weightsBudget({
        vramGB: vram,
        contextTokens: context,
        batchSize: concurrency,
        headroomPct: safety,
      }),
    [vram, context, concurrency, safety],
  );

  // For the bar viz, pretend weights consume the entire budget so the split is visible.
  const weightsUsed = budget.weightsBudget;

  return (
    <div className="calc" id="calculator" data-screen-label="calculator">
      <div className="calc-header">
        <span>
          {`$ vrambudget --gpu ${gpu.slug} --ctx ${context} --conc ${concurrency} --safety ${safety}%`}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Copy shareable URL of this calculator state"
            style={{
              background: "transparent",
              border: `1px solid ${copied ? "var(--accent)" : "var(--line-strong)"}`,
              color: copied ? "var(--accent)" : "var(--text)",
              fontFamily: "var(--mono)",
              fontSize: 11,
              padding: "5px 10px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              cursor: "pointer",
              transition: "color 80ms linear, border-color 80ms linear",
            }}
          >
            {copied ? "✓ copied" : "↗ copy link"}
          </button>
          <span className="dot-row">
            <span className="dot live" />
            <span>live</span>
          </span>
        </span>
      </div>

      <GpuGridSection
        category={category}
        onCategoryChange={setCategory}
        selectedSlug={gpu.slug}
        onSelect={setGpuAndResetVram}
      />

      <div className="calc-body">
        <div className="sliders">
          <SliderRow
            label="VRAM"
            value={vram}
            min={4}
            max={192}
            step={1}
            unit="GB"
            onChange={setVramTouched}
          />
          <SliderRow
            label="System RAM"
            value={sysRam}
            min={8}
            max={512}
            step={8}
            unit="GB"
            onChange={setSysRam}
          />
          <SliderRow
            label="Context"
            value={context}
            min={2048}
            max={131072}
            step={1024}
            unit="tok"
            onChange={setContext}
            format={(v) => (v >= 1024 ? `${(v / 1024).toFixed(0)}K` : String(v))}
          />
          <SliderRow
            label="Concurrency"
            value={concurrency}
            min={1}
            max={16}
            step={1}
            unit="req"
            onChange={setConcurrency}
          />
          <SliderRow
            label="Safety headroom"
            value={safety}
            min={5}
            max={40}
            step={1}
            unit="%"
            onChange={setSafety}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <TilesPanel
            total={vram}
            kv={budget.kvCache}
            overhead={budget.framework}
            budget={budget.weightsBudget}
          />
        </div>
      </div>

      <BudgetBarRow
        total={vram}
        kv={budget.kvCache}
        overhead={budget.framework}
        safety={safety}
        weightsUsed={weightsUsed}
      />

      <div className="tab-bar">
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "curated"}
            className={"tab" + (tab === "curated" ? " active" : "")}
            onClick={() => setTab("curated")}
          >
            Curated picks <span className="count">[{MODELS.length}]</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "search"}
            className={"tab" + (tab === "search" ? " active" : "")}
            onClick={() => setTab("search")}
          >
            Search Hugging Face
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "size"}
            className={"tab" + (tab === "size" ? " active" : "")}
            onClick={() => setTab("size")}
          >
            By size
          </button>
        </div>
        <div className="search-mini">↳ sorted by best fit</div>
      </div>

      {tab === "curated" && <CuratedList budget={budget} />}
      {tab === "search" && <SearchPane budget={budget} />}
      {tab === "size" && <BySizePane budget={budget} />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// GPU grid — category strip + card grid
// ────────────────────────────────────────────────────────────────────────────

interface GpuGridSectionProps {
  category: GpuCategory;
  onCategoryChange: (cat: GpuCategory) => void;
  selectedSlug: string;
  onSelect: (gpu: GPU) => void;
}

function GpuGridSection({
  category,
  onCategoryChange,
  selectedSlug,
  onSelect,
}: GpuGridSectionProps) {
  const gpus = GPUS.filter((g) => g.category === category);

  return (
    <div data-screen-label="gpu-grid">
      <div className="gpu-cats" role="tablist" aria-label="GPU family">
        {GPU_CATEGORIES.map((c) => {
          const count = GPUS.filter((g) => g.category === c.id).length;
          const isActive = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={"gpu-cat" + (isActive ? " active" : "")}
              onClick={() => onCategoryChange(c.id)}
            >
              <span className="gc-label">{c.label}</span>
              <span className="gc-sub">{c.sub}</span>
              <span className="gc-count">[{count}]</span>
            </button>
          );
        })}
      </div>

      <div className="gpu-grid">
        {gpus.map((g) => {
          const detailHref = `/gpu/${g.slug}/`;
          const isActive = selectedSlug === g.slug;
          return (
            <div
              key={g.slug}
              className={"gpu-card" + (isActive ? " active" : "")}
              onClick={() => onSelect(g)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(g);
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isActive}
            >
              <div className="badge">{g.badge}</div>
              <div className="name">{g.name}</div>
              <div className="vram tnum">
                {g.vramGB}
                <span className="unit">GB</span>
              </div>
              <Link
                className="gpu-card-link"
                href={detailHref}
                onClick={(e) => e.stopPropagation()}
                aria-label={`View ${g.name} detail page`}
                title="View full page"
              >
                ↗
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// slider row
// ────────────────────────────────────────────────────────────────────────────

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  format,
}: SliderRowProps) {
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

// ────────────────────────────────────────────────────────────────────────────
// tiles + budget bar
// ────────────────────────────────────────────────────────────────────────────

interface TilesPanelProps {
  total: number;
  kv: number;
  overhead: number;
  budget: number;
}

function TilesPanel({ total, kv, overhead, budget }: TilesPanelProps) {
  const safeTotal = total > 0 ? total : 1;
  return (
    <div className="tiles">
      <div className="tile">
        <div className="lbl">
          <span className="dash">01</span> Total VRAM
        </div>
        <div className="num tnum">
          {fmtGB(total)}
          <span className="unit">GB</span>
        </div>
        <div className="pct">device capacity</div>
      </div>
      <div className="tile">
        <div className="lbl">
          <span className="dash">02</span> KV cache
        </div>
        <div className="num tnum">
          {fmtGB(kv)}
          <span className="unit">GB</span>
        </div>
        <div className="pct">{((kv / safeTotal) * 100).toFixed(1)}% of total</div>
      </div>
      <div className="tile">
        <div className="lbl">
          <span className="dash">03</span> Runtime overhead
        </div>
        <div className="num tnum">
          {fmtGB(overhead)}
          <span className="unit">GB</span>
        </div>
        <div className="pct">
          {((overhead / safeTotal) * 100).toFixed(1)}% of total
        </div>
      </div>
      <div className="tile accent">
        <div className="lbl">
          <span className="dash">04</span> Weights budget
        </div>
        <div className="num tnum">
          {fmtGB(budget)}
          <span className="unit">GB</span>
        </div>
        <div className="pct">
          {((budget / safeTotal) * 100).toFixed(0)}% of total
        </div>
      </div>
    </div>
  );
}

interface BudgetBarRowProps {
  total: number;
  kv: number;
  overhead: number;
  safety: number;
  weightsUsed: number;
}

function BudgetBarRow({
  total,
  kv,
  overhead,
  safety,
  weightsUsed,
}: BudgetBarRowProps) {
  const safeTotal = total > 0 ? total : 1;
  const safetyGB = total * (safety / 100);
  const weightsPct = Math.min(100, (weightsUsed / safeTotal) * 100);
  const kvPct = (kv / safeTotal) * 100;
  const overheadPct = (overhead / safeTotal) * 100;
  const safetyPct = (safetyGB / safeTotal) * 100;
  return (
    <div className="budget-bar">
      <div className="row">
        <span>$ budget allocation</span>
        <span className="right tnum">
          {fmtGB(weightsUsed + kv + overhead)} / {fmtGB(total)} GB used
        </span>
      </div>
      <div className="bar">
        <div
          className="seg-weights"
          style={{ width: weightsPct + "%" }}
          title="weights"
        />
        <div
          className="seg-kv"
          style={{ width: kvPct + "%" }}
          title="kv cache"
        />
        <div
          className="seg-overhead"
          style={{ width: overheadPct + "%" }}
          title="overhead"
        />
        <div
          className="seg-safety"
          style={{ width: safetyPct + "%" }}
          title="safety headroom"
        />
      </div>
      <div className="bar-legend">
        <span>
          <span className="sw" style={{ background: "var(--accent)" }} />
          weights
        </span>
        <span>
          <span
            className="sw"
            style={{ background: "rgba(255,169,71,0.55)" }}
          />
          kv cache
        </span>
        <span>
          <span
            className="sw"
            style={{ background: "rgba(255,169,71,0.28)" }}
          />
          overhead
        </span>
        <span>
          <span
            className="sw"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--line-strong)",
            }}
          />
          safety
        </span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// curated tab
// ────────────────────────────────────────────────────────────────────────────

interface CuratedRow {
  m: Model;
  best: Quant;
  bestSize: number;
  fit: FitClass;
}

function CuratedList({ budget }: { budget: Budget }) {
  const rows: CuratedRow[] = MODELS.map((m) => {
    const best = bestQuantForBudget(m.params, budget.weightsBudget);
    const bestSize = modelSizeGB(m.params, best.bits);
    const fit = classifyFit(bestSize, budget);
    return { m, best, bestSize, fit };
  });

  const sorted = rows.slice().sort((a, b) => {
    if (FIT_ORDER[a.fit] !== FIT_ORDER[b.fit]) {
      return FIT_ORDER[a.fit] - FIT_ORDER[b.fit];
    }
    if (a.fit === "over") return a.m.params - b.m.params;
    return b.m.params - a.m.params;
  });

  const grouped = FIT_GROUPS
    .map((g) => ({ key: g, items: sorted.filter((r) => r.fit === g) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="model-list">
      {grouped.map((g) => (
        <div key={g.key}>
          <div className="model-group-head">
            <span className={"pill " + g.key}>{g.key}</span>
            <span className="g-label">{FIT_GROUP_COPY[g.key]}</span>
            <span className="g-count tnum">
              {g.items.length} model{g.items.length !== 1 ? "s" : ""}
            </span>
          </div>
          {g.items.map(({ m, best, bestSize, fit }) => (
            <div className="model-row" key={m.slug}>
              <div className="m-name">
                <a
                  href={`https://huggingface.co/${m.hfRepo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {m.name}
                </a>
                <span className="params tnum">{m.params}B</span>
              </div>
              <div className="m-pills">
                {QUANTS.map((q) => {
                  const size = modelSizeGB(m.params, q.bits);
                  return (
                    <span
                      key={q.id}
                      className={"pill" + (q.id === best.id ? " on" : "")}
                      title={`${q.label}: ${fmtGB(size)} GB`}
                    >
                      {q.label}
                    </span>
                  );
                })}
              </div>
              <div className="m-size tnum">
                {fmtGB(bestSize)}
                <span className="unit"> GB</span>
              </div>
              <div className="m-fit">
                <span className={"pill " + fit}>{fit}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// search tab
// ────────────────────────────────────────────────────────────────────────────

function SearchPane({ budget }: { budget: Budget }) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<HFSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const r = await searchHF(trimmed);
      setResults(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "search failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const q4 = QUANTS.find((x) => x.id === "q4km") ?? QUANTS[5];

  return (
    <div className="search-pane">
      <form className="search-row" onSubmit={onSubmit}>
        <div className="search-prefix">$</div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search huggingface for a model name..."
          aria-label="search Hugging Face"
        />
        <button type="submit" disabled={loading}>
          {loading ? "searching..." : "search"}
        </button>
      </form>
      <div
        className="model-list"
        style={{ marginTop: 24, border: "1px solid var(--line)" }}
      >
        {loading && (
          <div
            style={{
              padding: 24,
              fontFamily: "var(--mono)",
              color: "var(--text-dim)",
              fontSize: 13,
            }}
          >
            ↳ searching huggingface...
          </div>
        )}
        {!loading && error && (
          <div
            style={{
              padding: 24,
              fontFamily: "var(--mono)",
              color: "var(--red, #ff6a57)",
              fontSize: 13,
            }}
          >
            search failed: {error}
          </div>
        )}
        {!loading && !error && results.map((r) => {
          const params = inferParams(r.id);
          const size = params ? modelSizeGB(params, q4.bits) : 0;
          const fit: FitClass = params ? classifyFit(size, budget) : "over";
          return (
            <div className="model-row" key={r.id}>
              <div className="m-name">
                <a
                  href={`https://huggingface.co/${r.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {r.id}
                </a>
                {params !== null && (
                  <span className="params tnum">{params}B</span>
                )}
              </div>
              <div className="m-pills">
                <span className="pill on">{q4.label}</span>
                {r.downloads !== undefined && (
                  <span
                    className="pill"
                    style={{ color: "var(--text-faint)" }}
                    title={`${r.downloads} downloads`}
                  >
                    ↓ {fmtDownloads(r.downloads)}
                  </span>
                )}
              </div>
              <div className="m-size tnum">
                {params ? fmtGB(size) : "—"}
                <span className="unit"> GB</span>
              </div>
              <div className="m-fit">
                <span className={"pill " + fit}>{fit}</span>
              </div>
            </div>
          );
        })}
        {!loading && !error && results.length === 0 && (
          <div
            style={{
              padding: 24,
              fontFamily: "var(--mono)",
              color: "var(--text-faint)",
              fontSize: 13,
            }}
          >
            {hasSearched
              ? "no results. try a different query."
              : "search huggingface for a model name..."}
          </div>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// by-size tab
// ────────────────────────────────────────────────────────────────────────────

function BySizePane({ budget }: { budget: Budget }) {
  const [params, setParams] = useState<number>(13);
  const quants = QUANTS.slice(0, 9);
  return (
    <div className="size-pane">
      <div className="size-controls">
        <label
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Params
        </label>
        <input
          type="range"
          min={1}
          max={405}
          step={1}
          value={params}
          onChange={(e) => setParams(parseFloat(e.target.value))}
          aria-label="parameter count"
        />
        <div
          className="val mono tnum"
          style={{ fontSize: 14, textAlign: "right" }}
        >
          {params}
          <span className="unit"> B</span>
        </div>
      </div>
      <div className="size-grid">
        {quants.map((q) => {
          const size = modelSizeGB(params, q.bits);
          const fit = classifyFit(size, budget);
          return (
            <div key={q.id} className={"size-cell " + fit}>
              <div className="quant">
                {q.label}{" "}
                <span style={{ color: "var(--text-faint)" }}>
                  · {q.bits} bit
                </span>
              </div>
              <div className="gb tnum">
                {fmtGB(size)}
                <span className="unit">GB</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
