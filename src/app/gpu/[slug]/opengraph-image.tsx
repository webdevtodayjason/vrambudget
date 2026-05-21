import { ImageResponse } from 'next/og';
import { GPUS, gpuBySlug } from '@/lib/gpus';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'vrambudget GPU detail card';

// Force static generation so each per-slug OG image is pre-rendered at build
// time (compatible with next.config.ts `output: 'export'`).
export const dynamic = 'force-static';

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  return GPUS.map((g) => ({ slug: g.slug }));
}

export default async function GpuOpengraphImage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const gpu = gpuBySlug(slug);
  const name = gpu?.name ?? 'Unknown GPU';
  const vram = gpu?.vramGB ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0A0A0A',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          padding: '64px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#FFA947',
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 32,
              color: '#FFFFFF',
              fontSize: 200,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1,
            }}
          >
            {`${vram}GB`}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            color: '#6B6B6B',
            fontSize: 28,
            letterSpacing: '0.08em',
          }}
        >
          vrambudget.com
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    },
  );
}
