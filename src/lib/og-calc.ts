// src/lib/og-calc.ts
//
// Server-side helpers for resolving raw /calc?... searchParams into a
// computed calculator state, plus a stable URL builder for the OG image
// route. Used by:
//   - /calc/page.tsx generateMetadata({ searchParams }) — sets og:image
//   - /api/og/calc/route.ts — renders the ImageResponse from same params
//
// Anything safe to leave at default gets stripped from the OG URL so
// link previews cache by canonical query.

import { gpuBySlug, type GPU } from './gpus';
import { CALC_DEFAULTS, readCalcUrl, type CalcTab } from './calc-url';
import { weightsBudget, type Budget } from './vram';

export interface ResolvedCalcParams {
  gpu: GPU;
  vram: number;
  context: number;
  contextLabel: string; // "32K", "8K", "128K"
  concurrency: number;
  safety: number;
  tab: CalcTab;
  budget: Budget;
  weightsBudget: number;
}

function fmtContextLabel(tokens: number): string {
  if (tokens >= 1024 && tokens % 1024 === 0) return `${tokens / 1024}K`;
  if (tokens >= 1024) return `${(tokens / 1024).toFixed(1)}K`;
  return String(tokens);
}

export function resolveCalcParams(
  rawSearch: Record<string, string>,
): ResolvedCalcParams {
  // Reuse the calc-url decoder so the shape stays in sync with the client.
  const qs = new URLSearchParams(rawSearch).toString();
  const parsed = readCalcUrl(qs);

  const gpu = parsed.gpuSlug
    ? gpuBySlug(parsed.gpuSlug) ?? gpuBySlug(CALC_DEFAULTS.gpu)!
    : gpuBySlug(CALC_DEFAULTS.gpu)!;
  const vram = parsed.vramOverride ?? gpu.vramGB;
  const context = parsed.context ?? CALC_DEFAULTS.context;
  const concurrency = parsed.concurrency ?? CALC_DEFAULTS.concurrency;
  const safety = parsed.safety ?? CALC_DEFAULTS.safety;
  const tab = parsed.tab ?? CALC_DEFAULTS.tab;

  const budget = weightsBudget({
    vramGB: vram,
    contextTokens: context,
    batchSize: concurrency,
    headroomPct: safety,
  });

  return {
    gpu,
    vram,
    contextLabel: fmtContextLabel(context),
    context,
    concurrency,
    safety,
    tab,
    budget,
    weightsBudget: budget.weightsBudget,
  };
}

/**
 * Build the query string for the /api/og/calc image route.
 * Only non-default keys are included so the OG URL is canonical and
 * cacheable per unique configuration.
 */
export function buildOgQuery(resolved: ResolvedCalcParams): string {
  const params = new URLSearchParams();

  if (resolved.gpu.slug !== CALC_DEFAULTS.gpu) {
    params.set('gpu', resolved.gpu.slug);
  }
  if (resolved.vram !== resolved.gpu.vramGB) {
    params.set('vram', String(resolved.vram));
  }
  if (resolved.context !== CALC_DEFAULTS.context) {
    params.set('ctx', resolved.contextLabel.toLowerCase());
  }
  if (resolved.concurrency !== CALC_DEFAULTS.concurrency) {
    params.set('conc', String(resolved.concurrency));
  }
  if (resolved.safety !== CALC_DEFAULTS.safety) {
    params.set('safety', String(resolved.safety));
  }
  if (resolved.tab !== CALC_DEFAULTS.tab) {
    params.set('tab', resolved.tab);
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
