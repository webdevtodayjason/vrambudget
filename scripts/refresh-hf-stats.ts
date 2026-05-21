// scripts/refresh-hf-stats.ts
//
// Fetches Hugging Face stats (downloads / likes / last_modified / library /
// license) for every curated model and writes them to data/hf-stats.json.
//
// Runs as a prebuild step; cached locally so repeat dev builds don't re-fetch.
// Cache TTL: 24 hours. Override with REFRESH_HF=1 env var.
//
// Failures degrade gracefully: missing data just means the model page renders
// without the stats row. Never blocks the build.

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { MODELS } from '../src/lib/models';

const OUT_PATH = path.join(process.cwd(), 'data', 'hf-stats.json');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface HfStat {
  hf_repo: string;
  downloads?: number;
  likes?: number;
  last_modified?: string;
  library?: string;
  license?: string;
  fetched_at: string;
}

type HfStatsFile = Record<string, HfStat>;

async function loadCache(): Promise<HfStatsFile> {
  try {
    const raw = await fs.readFile(OUT_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function fetchOne(repo: string): Promise<HfStat | null> {
  // HF API expects the org/name path with unencoded slashes.
  const url = `https://huggingface.co/api/models/${repo}`;
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'vrambudget.com (https://vrambudget.com)' },
    });
    if (!res.ok) {
      console.warn(`[hf-stats] ${repo}: ${res.status}`);
      return null;
    }
    const data: any = await res.json();
    return {
      hf_repo: repo,
      downloads: typeof data.downloads === 'number' ? data.downloads : undefined,
      likes: typeof data.likes === 'number' ? data.likes : undefined,
      last_modified: typeof data.lastModified === 'string' ? data.lastModified : undefined,
      library: typeof data.library_name === 'string' ? data.library_name : undefined,
      license: typeof data?.cardData?.license === 'string' ? data.cardData.license : undefined,
      fetched_at: new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`[hf-stats] ${repo}: fetch failed`, (e as Error).message);
    return null;
  }
}

function isStale(stat: HfStat | undefined, force: boolean): boolean {
  if (force) return true;
  if (!stat) return true;
  const age = Date.now() - new Date(stat.fetched_at).getTime();
  return age > CACHE_TTL_MS;
}

async function main() {
  const force = process.env.REFRESH_HF === '1';
  const cache = await loadCache();
  let refreshed = 0;
  let cached = 0;

  for (const m of MODELS) {
    const key = m.slug;
    const existing = cache[key];
    if (existing && existing.hf_repo === m.hfRepo && !isStale(existing, force)) {
      cached++;
      continue;
    }
    const stat = await fetchOne(m.hfRepo);
    if (stat) {
      cache[key] = stat;
      refreshed++;
    } else if (existing) {
      // Keep stale data rather than dropping it.
      cached++;
    }
    // Be polite to the HF API: small delay between requests.
    await new Promise((r) => setTimeout(r, 80));
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(cache, null, 2) + '\n', 'utf8');

  console.log(`[hf-stats] refreshed ${refreshed}, kept-cached ${cached}, total ${Object.keys(cache).length}`);
  console.log(`[hf-stats] wrote ${OUT_PATH}`);
}

main().catch((e) => {
  console.error('[hf-stats] fatal:', e);
  // Don't fail the build on enrichment errors.
  process.exit(0);
});
