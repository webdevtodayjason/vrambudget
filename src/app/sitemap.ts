import type { MetadataRoute } from 'next';

import { GPUS } from '@/lib/gpus';
import { MODELS } from '@/lib/models';
import { RUNTIMES } from '@/lib/runtimes';
import { POPULAR_COMPARISONS, canonicalPair } from '@/lib/compare';

const BASE_URL = 'https://vrambudget.com';

// Required for `output: 'export'` static export.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const changeFrequency = 'monthly' as const;

  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/the-math/`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/glossary/`,
      lastModified,
      changeFrequency,
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/learn/`,
      lastModified,
      changeFrequency,
      priority: 0.92,
    },
    {
      url: `${BASE_URL}/calc/`,
      lastModified,
      changeFrequency,
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/gpu/`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/model/`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/runtime/`,
      lastModified,
      changeFrequency,
      priority: 0.9,
    },
    ...GPUS.map((gpu) => ({
      url: `${BASE_URL}/gpu/${gpu.slug}/`,
      lastModified,
      changeFrequency,
      priority: 0.8,
    })),
    ...MODELS.map((model) => ({
      url: `${BASE_URL}/model/${model.slug}/`,
      lastModified,
      changeFrequency,
      priority: 0.8,
    })),
    ...RUNTIMES.map((r) => ({
      url: `${BASE_URL}/runtime/${r.slug}/`,
      lastModified,
      changeFrequency,
      priority: 0.8,
    })),
    ...POPULAR_COMPARISONS.map(({ a, b }) => {
      const c = canonicalPair(a, b);
      return {
        url: `${BASE_URL}/compare/${c.a}/${c.b}/`,
        lastModified,
        changeFrequency,
        priority: 0.75,
      };
    }),
    ...MODELS.map((m) => ({
      url: `${BASE_URL}/can-i-run/${m.slug}/`,
      lastModified,
      changeFrequency,
      priority: 0.8,
    })),
    ...MODELS.map((m) => ({
      url: `${BASE_URL}/best-gpu-for/${m.slug}/`,
      lastModified,
      changeFrequency,
      priority: 0.8,
    })),
  ];
}
