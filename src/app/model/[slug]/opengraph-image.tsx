import { ImageResponse } from 'next/og';
import { MODELS, modelBySlug } from '@/lib/models';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'vrambudget: model VRAM requirements';
export const dynamic = 'force-static';

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  return MODELS.map((m) => ({ slug: m.slug }));
}

function fmtParams(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

export default async function ModelOpengraphImage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const m = modelBySlug(slug);
  const name = m?.name ?? slug;
  const paramsLine = m ? `${fmtParams(m.params)}B params` : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#0A0A0A',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            color: '#FFA947',
            fontSize: 48,
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          {name}
        </div>
        <div
          style={{
            display: 'flex',
            color: '#FFFFFF',
            fontSize: 144,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          {paramsLine}
        </div>
        <div
          style={{
            display: 'flex',
            color: '#6B6B6B',
            fontSize: 32,
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
