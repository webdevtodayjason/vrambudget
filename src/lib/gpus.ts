// src/lib/gpus.ts

export type GpuCategory =
  | 'rtx-30'
  | 'rtx-40'
  | 'rtx-50'
  | 'apple'
  | 'workstation'
  | 'datacenter'
  | 'amd'
  | 'intel';

export interface GPU {
  slug: string;
  name: string;
  vramGB: number;
  bandwidthGBs: number;
  fp16Tflops: number;
  budget8kGB: number;
  summary: string;
  category: GpuCategory;
  badge: string;
}

export const GPU_CATEGORIES: { id: GpuCategory; label: string; sub: string }[] = [
  { id: 'rtx-50', label: 'RTX 50', sub: 'Blackwell' },
  { id: 'rtx-40', label: 'RTX 40', sub: 'Ada Lovelace' },
  { id: 'rtx-30', label: 'RTX 30', sub: 'Ampere' },
  { id: 'apple', label: 'Apple Silicon', sub: 'M2 · M3 · M4' },
  { id: 'workstation', label: 'Workstation', sub: 'A6000 · 6000 Ada · Pro 6000' },
  { id: 'datacenter', label: 'Datacenter', sub: 'H100 · H200 · B200' },
  { id: 'amd', label: 'AMD', sub: 'Radeon · Instinct' },
  { id: 'intel', label: 'Intel', sub: 'Arc · Gaudi' },
];

export const GPUS: GPU[] = [
  // RTX 30 (Ampere)
  {
    slug: 'rtx-3060',
    name: 'RTX 3060 12GB',
    vramGB: 12,
    bandwidthGBs: 360,
    fp16Tflops: 51.0,
    budget8kGB: 8.3,
    summary: 'Entry-level Ampere. Comfortable home for 7B-8B models at Q5_K_M; 13B at Q4.',
    category: 'rtx-30',
    badge: 'ampere',
  },
  {
    slug: 'rtx-3070',
    name: 'RTX 3070',
    vramGB: 8,
    bandwidthGBs: 448,
    fp16Tflops: 81.0,
    budget8kGB: 5.1,
    summary: '8GB ceiling. Sticks to 7B at Q5 or 13B at Q3. VRAM is the bottleneck, not silicon.',
    category: 'rtx-30',
    badge: 'ampere',
  },
  {
    slug: 'rtx-3080',
    name: 'RTX 3080',
    vramGB: 10,
    bandwidthGBs: 760,
    fp16Tflops: 119.0,
    budget8kGB: 6.7,
    summary: '10GB. Runs 7B at FP16 or 13B at Q5 with breathing room.',
    category: 'rtx-30',
    badge: 'ampere',
  },
  {
    slug: 'rtx-3080-ti',
    name: 'RTX 3080 Ti',
    vramGB: 12,
    bandwidthGBs: 912,
    fp16Tflops: 136.0,
    budget8kGB: 8.3,
    summary: "12GB. The 'budget 70B' option — at Q3, with a tight context window.",
    category: 'rtx-30',
    badge: 'ampere',
  },
  {
    slug: 'rtx-3090',
    name: 'RTX 3090',
    vramGB: 24,
    bandwidthGBs: 936,
    fp16Tflops: 142.0,
    budget8kGB: 18.0,
    summary: 'The used-market workhorse. 70B at Q3, 34B at Q5, 13B at FP16. Cheap for the VRAM.',
    category: 'rtx-30',
    badge: 'ampere',
  },
  {
    slug: 'rtx-3090-ti',
    name: 'RTX 3090 Ti',
    vramGB: 24,
    bandwidthGBs: 1008,
    fp16Tflops: 160.0,
    budget8kGB: 18.0,
    summary: 'Same VRAM as 3090, slightly faster. Same model fits, same context limits.',
    category: 'rtx-30',
    badge: 'ampere',
  },
  // RTX 40 (Ada Lovelace)
  {
    slug: 'rtx-4060',
    name: 'RTX 4060',
    vramGB: 8,
    bandwidthGBs: 272,
    fp16Tflops: 121.0,
    budget8kGB: 5.1,
    summary: '8GB Ada. Modern silicon, weak VRAM. 7B at Q5 and call it done.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4060-ti',
    name: 'RTX 4060 Ti 16GB',
    vramGB: 16,
    bandwidthGBs: 288,
    fp16Tflops: 175.0,
    budget8kGB: 12.0,
    summary: 'The quiet sleeper. 16GB at consumer pricing. Runs 13B at FP16 or 30B at Q4.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4070',
    name: 'RTX 4070',
    vramGB: 12,
    bandwidthGBs: 504,
    fp16Tflops: 230.0,
    budget8kGB: 8.3,
    summary: '12GB. Comfortable 13B at Q8, 7B at FP16.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4070-s',
    name: 'RTX 4070 Super',
    vramGB: 12,
    bandwidthGBs: 504,
    fp16Tflops: 280.0,
    budget8kGB: 8.3,
    summary: 'Same VRAM as 4070, more compute. Throughput, not capacity.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4070-ti-s',
    name: 'RTX 4070 Ti Super',
    vramGB: 16,
    bandwidthGBs: 672,
    fp16Tflops: 350.0,
    budget8kGB: 12.0,
    summary: '16GB plus Ada speed. Strong 13B/30B card for under flagship money.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4080',
    name: 'RTX 4080',
    vramGB: 16,
    bandwidthGBs: 717,
    fp16Tflops: 390.0,
    budget8kGB: 12.0,
    summary: '16GB. 30B at Q4 comfortably, 13B at Q8 with long context.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4080-s',
    name: 'RTX 4080 Super',
    vramGB: 16,
    bandwidthGBs: 736,
    fp16Tflops: 410.0,
    budget8kGB: 12.0,
    summary: 'Modest bump over 4080. Same fits, faster throughput.',
    category: 'rtx-40',
    badge: 'ada',
  },
  {
    slug: 'rtx-4090',
    name: 'RTX 4090',
    vramGB: 24,
    bandwidthGBs: 1008,
    fp16Tflops: 330.0,
    budget8kGB: 18.0,
    summary: 'The consumer flagship. Comfortably runs Llama-3.1 70B at Q4_K_M, Mixtral 8x7B at Q5, and any 30B-class model at Q8_0.',
    category: 'rtx-40',
    badge: 'ada · flagship',
  },
  // RTX 50 (Blackwell)
  {
    slug: 'rtx-5070',
    name: 'RTX 5070',
    vramGB: 12,
    bandwidthGBs: 672,
    fp16Tflops: 380.0,
    budget8kGB: 8.3,
    summary: '12GB Blackwell. Faster than 4070; same VRAM ceiling.',
    category: 'rtx-50',
    badge: 'blackwell',
  },
  {
    slug: 'rtx-5070-ti',
    name: 'RTX 5070 Ti',
    vramGB: 16,
    bandwidthGBs: 896,
    fp16Tflops: 510.0,
    budget8kGB: 12.0,
    summary: '16GB Blackwell. The new mainstream 30B-at-Q4 pick.',
    category: 'rtx-50',
    badge: 'blackwell',
  },
  {
    slug: 'rtx-5080',
    name: 'RTX 5080',
    vramGB: 16,
    bandwidthGBs: 960,
    fp16Tflops: 565.0,
    budget8kGB: 12.0,
    summary: '16GB Blackwell flagship-1. Solid 30B at Q4 with long context.',
    category: 'rtx-50',
    badge: 'blackwell',
  },
  {
    slug: 'rtx-5090',
    name: 'RTX 5090',
    vramGB: 32,
    bandwidthGBs: 1792,
    fp16Tflops: 838.0,
    budget8kGB: 25.0,
    summary: '32GB GDDR7. The new consumer ceiling: 70B at Q4 with comfortable context, 30B at FP16.',
    category: 'rtx-50',
    badge: 'blackwell · flagship',
  },
  // Apple Silicon
  {
    slug: 'm2-max-64',
    name: 'M2 Max 64',
    vramGB: 64,
    bandwidthGBs: 400,
    fp16Tflops: 27.0,
    budget8kGB: 50.0,
    summary: 'Unified 64GB. Big models, slow speed. 70B at Q5, but tokens-per-second is the trade.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm2-ultra-192',
    name: 'M2 Ultra 192',
    vramGB: 192,
    bandwidthGBs: 800,
    fp16Tflops: 54.0,
    budget8kGB: 154.0,
    summary: '192GB unified. Runs 405B at Q3. The Mac Pro / Studio answer to multi-GPU rigs.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm3-max-64',
    name: 'M3 Max 64',
    vramGB: 64,
    bandwidthGBs: 400,
    fp16Tflops: 35.0,
    budget8kGB: 50.0,
    summary: '64GB unified. Comfortable 70B at Q4_K_M with the whole machine to itself.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm3-max-96',
    name: 'M3 Max 96',
    vramGB: 96,
    bandwidthGBs: 400,
    fp16Tflops: 35.0,
    budget8kGB: 76.0,
    summary: '96GB unified. 70B at Q6 or 120B at Q4. Quiet, cool, portable.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm4-pro-64',
    name: 'M4 Pro 64',
    vramGB: 64,
    bandwidthGBs: 273,
    fp16Tflops: 32.0,
    budget8kGB: 50.0,
    summary: '64GB on the Pro tier. Same model fits as M3 Max 64, narrower bandwidth.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm4-max-128',
    name: 'M4 Max 128',
    vramGB: 128,
    bandwidthGBs: 546,
    fp16Tflops: 42.0,
    budget8kGB: 102.0,
    summary: '128GB unified. Runs 70B at FP16 or 120B at Q6. The MacBook for serious inference.',
    category: 'apple',
    badge: 'apple',
  },
  {
    slug: 'm3-ultra-512',
    name: 'M3 Ultra 512',
    vramGB: 512,
    bandwidthGBs: 819,
    fp16Tflops: 80.0,
    budget8kGB: 413.0,
    summary: '512GB unified memory in a Mac Studio. Runs DeepSeek-V3 at Q4. Yes, really.',
    category: 'apple',
    badge: 'apple · monster',
  },
  // Workstation
  {
    slug: 'a6000',
    name: 'RTX A6000',
    vramGB: 48,
    bandwidthGBs: 768,
    fp16Tflops: 155.0,
    budget8kGB: 37.0,
    summary: '48GB ECC. The reliable workstation pick. 70B at Q5 comfortably; 30B at FP16.',
    category: 'workstation',
    badge: 'ampere · 48GB',
  },
  {
    slug: 'rtx-6000-ada',
    name: 'RTX 6000 Ada',
    vramGB: 48,
    bandwidthGBs: 960,
    fp16Tflops: 364.0,
    budget8kGB: 37.0,
    summary: 'Same 48GB, modern silicon. Faster than A6000 across the board.',
    category: 'workstation',
    badge: 'ada · 48GB',
  },
  {
    slug: 'rtx-6000-pro',
    name: 'RTX Pro 6000',
    vramGB: 96,
    bandwidthGBs: 1792,
    fp16Tflops: 510.0,
    budget8kGB: 76.0,
    summary: '96GB Blackwell workstation. 405B at Q3, 70B at FP16. Without the datacenter price tag.',
    category: 'workstation',
    badge: 'blackwell · 96GB',
  },
  {
    slug: 'l40s',
    name: 'L40S',
    vramGB: 48,
    bandwidthGBs: 864,
    fp16Tflops: 365.0,
    budget8kGB: 37.0,
    summary: '48GB Ada server card. Production inference workhorse — pairs well in 2x or 4x configs.',
    category: 'workstation',
    badge: 'ada · datacenter',
  },
  // Datacenter
  {
    slug: 'h100',
    name: 'H100 80GB',
    vramGB: 80,
    bandwidthGBs: 3350,
    fp16Tflops: 989.0,
    budget8kGB: 63.0,
    summary: '80GB HBM3. The datacenter standard. Production-grade 70B at FP16 with long context.',
    category: 'datacenter',
    badge: 'hopper',
  },
  {
    slug: 'h200',
    name: 'H200',
    vramGB: 141,
    bandwidthGBs: 4800,
    fp16Tflops: 989.0,
    budget8kGB: 113.0,
    summary: '141GB HBM3e. H100 with more memory. 70B at FP16 with extreme context, or 120B at Q8.',
    category: 'datacenter',
    badge: 'hopper',
  },
  {
    slug: 'b200',
    name: 'B200',
    vramGB: 192,
    bandwidthGBs: 8000,
    fp16Tflops: 2250.0,
    budget8kGB: 154.0,
    summary: '192GB HBM3e. The Blackwell datacenter flagship. 405B at Q4, 200B at FP16.',
    category: 'datacenter',
    badge: 'blackwell',
  },
  {
    slug: 'dgx-spark',
    name: 'DGX Spark',
    vramGB: 128,
    bandwidthGBs: 273,
    fp16Tflops: 1000.0,
    budget8kGB: 102.0,
    summary: '128GB unified Grace-Blackwell. Desktop form factor. Runs 70B at FP16 or 200B at Q5.',
    category: 'datacenter',
    badge: 'grace blackwell',
  },
  {
    slug: 'h100-nvl-2x',
    name: '2× H100 NVL',
    vramGB: 188,
    bandwidthGBs: 3938,
    fp16Tflops: 1979.0,
    budget8kGB: 151.0,
    summary: "Twin H100 NVL in NVLink. 188GB combined. The 'I want to run Llama-3.1 405B' rig.",
    category: 'datacenter',
    badge: 'multi-gpu',
  },
  // AMD
  {
    slug: 'rx-7900-xtx',
    name: 'RX 7900 XTX',
    vramGB: 24,
    bandwidthGBs: 960,
    fp16Tflops: 122.0,
    budget8kGB: 18.0,
    summary: '24GB AMD consumer flagship. ROCm path improving. Same model fits as 3090/4090.',
    category: 'amd',
    badge: 'rdna3',
  },
  {
    slug: 'w7900',
    name: 'Radeon Pro W7900',
    vramGB: 48,
    bandwidthGBs: 864,
    fp16Tflops: 122.0,
    budget8kGB: 37.0,
    summary: '48GB AMD workstation. The ROCm answer to the A6000. 70B at Q5.',
    category: 'amd',
    badge: 'rdna3 · workstation',
  },
  {
    slug: 'mi300x',
    name: 'MI300X',
    vramGB: 192,
    bandwidthGBs: 5300,
    fp16Tflops: 1300.0,
    budget8kGB: 154.0,
    summary: "192GB HBM3. AMD's H100 competitor. 405B at Q4 on a single accelerator.",
    category: 'amd',
    badge: 'cdna3 · datacenter',
  },
  // Intel
  {
    slug: 'arc-b580',
    name: 'Arc B580',
    vramGB: 12,
    bandwidthGBs: 456,
    fp16Tflops: 56.0,
    budget8kGB: 8.3,
    summary: '12GB Intel consumer. IPEX-LLM path. 7B comfortably; 13B at Q4.',
    category: 'intel',
    badge: 'battlemage',
  },
  {
    slug: 'arc-pro-b60',
    name: 'Arc Pro B60',
    vramGB: 24,
    bandwidthGBs: 456,
    fp16Tflops: 56.0,
    budget8kGB: 18.0,
    summary: "24GB on the Pro tier. Intel's answer to the 3090 used market.",
    category: 'intel',
    badge: 'battlemage · pro',
  },
  {
    slug: 'gaudi-3',
    name: 'Gaudi 3',
    vramGB: 128,
    bandwidthGBs: 3700,
    fp16Tflops: 1835.0,
    budget8kGB: 102.0,
    summary: "128GB HBM2e. Habana's transformer accelerator. 70B at FP16 in production.",
    category: 'intel',
    badge: 'datacenter',
  },
];

export function gpuBySlug(slug: string): GPU | undefined {
  return GPUS.find((g) => g.slug === slug);
}

export function gpusByCategory(cat: GpuCategory): GPU[] {
  return GPUS.filter((g) => g.category === cat);
}

/**
 * Return the n GPUs whose VRAM is closest to the given slug's, excluding itself.
 * Default n is 4. Ties broken by descending VRAM then alphabetical slug.
 */
export function nearbyGpusByVram(slug: string, n: number = 4): GPU[] {
  const target = gpuBySlug(slug);
  if (!target) return [];
  return GPUS.filter((g) => g.slug !== slug)
    .slice()
    .sort((a, b) => {
      const da = Math.abs(a.vramGB - target.vramGB);
      const db = Math.abs(b.vramGB - target.vramGB);
      if (da !== db) return da - db;
      if (a.vramGB !== b.vramGB) return b.vramGB - a.vramGB;
      return a.slug.localeCompare(b.slug);
    })
    .slice(0, n);
}
