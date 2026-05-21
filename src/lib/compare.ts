// src/lib/compare.ts
//
// Curated GPU comparison pairs. The /compare/[a]/[b] route pre-renders
// these at build time so the SEO-critical comparisons ("4090 vs 5090",
// "3090 vs 4090") are indexable as static pages.

export interface ComparisonPair {
  a: string; // gpu slug
  b: string;
}

export const POPULAR_COMPARISONS: ComparisonPair[] = [
  // Consumer flagship generation jumps
  { a: 'rtx-4090', b: 'rtx-5090' },
  { a: 'rtx-3090', b: 'rtx-4090' },
  { a: 'rtx-3090', b: 'rtx-5090' },
  // RTX 40 internal
  { a: 'rtx-4080', b: 'rtx-4090' },
  { a: 'rtx-4070-ti-s', b: 'rtx-4080-s' },
  // RTX 50 internal
  { a: 'rtx-5070-ti', b: 'rtx-5080' },
  { a: 'rtx-5080', b: 'rtx-5090' },
  // Used market vs new
  { a: 'rtx-3090', b: 'rtx-4080' },
  { a: 'rtx-3090-ti', b: 'rtx-4090' },
  // 16 GB sweet spot
  { a: 'rtx-4060-ti', b: 'rtx-4080' },
  { a: 'rtx-4060-ti', b: 'rtx-5070-ti' },
  // Apple Silicon generation
  { a: 'm3-max-96', b: 'm4-max-128' },
  { a: 'm4-max-128', b: 'm5-max-128' },
  { a: 'm2-ultra-192', b: 'm3-ultra-512' },
  { a: 'm3-ultra-512', b: 'm5-max-128' },
  // Apple vs NVIDIA
  { a: 'rtx-4090', b: 'm3-max-96' },
  { a: 'rtx-5090', b: 'm5-max-128' },
  { a: 'rtx-4090', b: 'm5-max-128' },
  // Workstation
  { a: 'a6000', b: 'rtx-6000-ada' },
  { a: 'rtx-6000-ada', b: 'rtx-6000-pro' },
  { a: 'a6000', b: 'rtx-4090' },
  // Datacenter
  { a: 'h100', b: 'h200' },
  { a: 'h100', b: 'b200' },
  { a: 'h200', b: 'b200' },
  { a: 'h100', b: 'h100-nvl-2x' },
  { a: 'h100-nvl-2x', b: 'b200' },
  // AMD
  { a: 'rx-7900-xtx', b: 'rtx-4090' },
  { a: 'mi300x', b: 'h100' },
  { a: 'mi300x', b: 'b200' },
  // Intel
  { a: 'arc-b580', b: 'rtx-4060' },
  { a: 'arc-pro-b60', b: 'rtx-4070' },
  { a: 'gaudi-3', b: 'h100' },
];

/**
 * Sort a pair so the canonical form is alphabetical (a < b). Lets us
 * de-duplicate "4090 vs 5090" and "5090 vs 4090" to the same URL.
 */
export function canonicalPair(a: string, b: string): { a: string; b: string } {
  return a < b ? { a, b } : { a: b, b: a };
}
