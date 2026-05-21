// src/lib/calc-url.ts
//
// Calculator URL encoding/decoding. Single source of truth for the shareable
// URL contract. Shape lives at /calc?gpu=<slug>&ctx=<n>&conc=<n>&safety=<n>...
// Defaults are stripped (cleaner shares).

import { gpuBySlug } from './gpus';
import { modelBySlug } from './models';

export type CalcTab = 'curated' | 'search' | 'size';

export interface CalcUrlState {
  gpuSlug: string;
  vramOverride?: number;
  context: number;
  concurrency: number;
  safety: number;
  tab: CalcTab;
  searchQuery?: string;
  modelSlug?: string;
}

export const CALC_DEFAULTS = {
  gpu: 'rtx-4090',
  context: 8192,
  concurrency: 1,
  safety: 15,
  tab: 'curated' as CalcTab,
};

// Friendly aliases so URLs can use familiar names. Falls back to the raw slug
// if a key isn't here.
const GPU_ALIASES: Record<string, string> = {
  // RTX 50
  '5090': 'rtx-5090',
  '5080': 'rtx-5080',
  '5070': 'rtx-5070',
  '5070-ti': 'rtx-5070-ti',
  // RTX 40
  '4090': 'rtx-4090',
  '4080': 'rtx-4080',
  '4080s': 'rtx-4080-s',
  '4070': 'rtx-4070',
  '4070s': 'rtx-4070-s',
  '4070-ti-s': 'rtx-4070-ti-s',
  '4060': 'rtx-4060',
  '4060-ti': 'rtx-4060-ti',
  // RTX 30
  '3090': 'rtx-3090',
  '3090-ti': 'rtx-3090-ti',
  '3080': 'rtx-3080',
  '3080-ti': 'rtx-3080-ti',
  '3070': 'rtx-3070',
  '3060': 'rtx-3060',
  // Apple
  'm5-max': 'm5-max-128',
  'm5-pro': 'm5-pro-64',
  'm4-max': 'm4-max-128',
  'm4-pro': 'm4-pro-64',
  'm3-ultra': 'm3-ultra-512',
  'm3-max': 'm3-max-96',
  'm2-ultra': 'm2-ultra-192',
  'm2-max': 'm2-max-64',
  // Workstation
  'a6000': 'a6000',
  '6000-ada': 'rtx-6000-ada',
  'pro-6000': 'rtx-6000-pro',
  'l40s': 'l40s',
  // Datacenter
  'h100': 'h100',
  'h200': 'h200',
  'b200': 'b200',
  // AMD
  '7900-xtx': 'rx-7900-xtx',
  'mi300x': 'mi300x',
};

function parseContextParam(s: string): number | null {
  const m = s.match(/^(\d+(?:\.\d+)?)\s*([kK])?$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  const tokens = m[2] ? Math.round(n * 1024) : Math.round(n);
  if (tokens < 256 || tokens > 1_048_576) return null;
  return tokens;
}

function fmtContextShort(tokens: number): string {
  if (tokens % 1024 === 0) return `${tokens / 1024}k`;
  return String(tokens);
}

export function readCalcUrl(search: string): Partial<CalcUrlState> {
  const out: Partial<CalcUrlState> = {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  } catch {
    return out;
  }

  const gpuParam = params.get('gpu');
  if (gpuParam) {
    const candidate = GPU_ALIASES[gpuParam.toLowerCase()] ?? gpuParam.toLowerCase();
    if (gpuBySlug(candidate)) out.gpuSlug = candidate;
  }

  const vramParam = params.get('vram');
  if (vramParam) {
    const n = parseInt(vramParam, 10);
    if (Number.isFinite(n) && n >= 4 && n <= 1024) out.vramOverride = n;
  }

  const ctxParam = params.get('ctx');
  if (ctxParam) {
    const tokens = parseContextParam(ctxParam);
    if (tokens !== null) out.context = tokens;
  }

  const concParam = params.get('conc');
  if (concParam) {
    const n = parseInt(concParam, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 64) out.concurrency = n;
  }

  const safetyParam = params.get('safety');
  if (safetyParam) {
    const n = parseInt(safetyParam, 10);
    if (Number.isFinite(n) && n >= 0 && n <= 50) out.safety = n;
  }

  const tabParam = params.get('tab');
  if (tabParam === 'curated' || tabParam === 'search' || tabParam === 'size') {
    out.tab = tabParam;
  }

  const qParam = params.get('q');
  if (qParam) out.searchQuery = qParam.slice(0, 100);

  const modelParam = params.get('model');
  if (modelParam && modelBySlug(modelParam)) out.modelSlug = modelParam;

  return out;
}

export function buildCalcQuery(state: CalcUrlState, gpuStockVram: number): string {
  const params = new URLSearchParams();

  if (state.gpuSlug !== CALC_DEFAULTS.gpu) params.set('gpu', state.gpuSlug);
  if (state.vramOverride !== undefined && state.vramOverride !== gpuStockVram) {
    params.set('vram', String(state.vramOverride));
  }
  if (state.context !== CALC_DEFAULTS.context) params.set('ctx', fmtContextShort(state.context));
  if (state.concurrency !== CALC_DEFAULTS.concurrency) {
    params.set('conc', String(state.concurrency));
  }
  if (state.safety !== CALC_DEFAULTS.safety) params.set('safety', String(state.safety));
  if (state.tab !== CALC_DEFAULTS.tab) params.set('tab', state.tab);
  if (state.searchQuery && state.tab === 'search') params.set('q', state.searchQuery);
  if (state.modelSlug) params.set('model', state.modelSlug);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}
