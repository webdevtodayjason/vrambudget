// src/lib/hf.ts

export interface HFSearchResult {
  id: string;          // org/repo, e.g. "Qwen/Qwen2.5-7B-Instruct-GGUF"
  downloads?: number;
  likes?: number;
  tags?: string[];
}

/**
 * Search Hugging Face for GGUF-quantized models.
 * Public API, no auth needed.
 */
export async function searchHF(query: string, limit: number = 20): Promise<HFSearchResult[]> {
  const url = new URL('https://huggingface.co/api/models');
  url.searchParams.set('search', query);
  url.searchParams.set('filter', 'gguf');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('sort', 'downloads');
  url.searchParams.set('direction', '-1');

  const resp = await fetch(url.toString());
  if (!resp.ok) throw new Error(`HF API returned ${resp.status}`);
  return resp.json();
}

/**
 * Infer parameter count from model name.
 * Handles "7B", "13b", "1.5B", "70B-Instruct", and MoE patterns like "8x7B".
 */
export function inferParams(name: string): number | null {
  // MoE pattern first (more specific)
  const moe = name.match(/(\d+)x(\d+(?:\.\d+)?)\s*[bB]/i);
  if (moe) return parseFloat(moe[1]) * parseFloat(moe[2]);

  const single = name.match(/(\d+(?:\.\d+)?)\s*[bB](?![a-zA-Z])/);
  if (single) return parseFloat(single[1]);

  return null;
}

/**
 * Format download count for display.
 */
export function fmtDownloads(n?: number): string {
  if (!n) return '';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}
