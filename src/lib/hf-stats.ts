// src/lib/hf-stats.ts
//
// Reader for the data/hf-stats.json produced by scripts/refresh-hf-stats.ts.
// Loaded synchronously at build/render time. If the file is missing or stale,
// callers get back undefined and the UI degrades gracefully.

import fs from 'node:fs';
import path from 'node:path';

export interface HfStat {
  hf_repo: string;
  downloads?: number;
  likes?: number;
  last_modified?: string;
  library?: string;
  license?: string;
  fetched_at: string;
}

let cache: Record<string, HfStat> | null = null;

function loadOnce(): Record<string, HfStat> {
  if (cache) return cache;
  const p = path.join(process.cwd(), 'data', 'hf-stats.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    cache = JSON.parse(raw) as Record<string, HfStat>;
  } catch {
    cache = {};
  }
  return cache;
}

export function hfStatFor(slug: string): HfStat | undefined {
  return loadOnce()[slug];
}

export function fmtDownloadsAbbr(n?: number): string {
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function fmtRelativeDays(iso?: string): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const days = Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
  if (days < 1) return 'today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}
