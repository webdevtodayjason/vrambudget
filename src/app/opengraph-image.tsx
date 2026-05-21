import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'vrambudget: VRAM ~= params × (bits ÷ 8)';

// Force static generation so this OG image is pre-rendered at build time
// (compatible with next.config.ts `output: 'export'`). Do NOT add
// `export const runtime = 'edge'` — that breaks static export.
export const dynamic = 'force-static';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0A0A0A',
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          padding: '64px',
        }}
      >
        <div
          style={{
            color: '#FFA947',
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          VRAM ~= params × (bits ÷ 8)
        </div>
        <div
          style={{
            marginTop: 48,
            color: '#6B6B6B',
            fontSize: 36,
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
