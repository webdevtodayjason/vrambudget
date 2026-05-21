import type { MetadataRoute } from 'next';

const BASE_URL = 'https://vrambudget.com';

// Required for `output: 'export'` static export.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
