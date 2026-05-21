import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

// Brand tokens, mirroring globals.css :root.
const BG = '#0A0A0A';
const ACCENT = '#FFA947';

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Scaled-up version of icon.svg: budget-bar mark, centered */}
        <div
          style={{
            display: 'flex',
            height: 42,
            width: 140,
          }}
        >
          <div style={{ width: 92, height: '100%', backgroundColor: ACCENT }} />
          <div
            style={{
              width: 28,
              height: '100%',
              backgroundColor: 'rgba(255, 169, 71, 0.55)',
            }}
          />
          <div
            style={{
              width: 14,
              height: '100%',
              backgroundColor: 'rgba(255, 169, 71, 0.28)',
            }}
          />
          <div
            style={{
              width: 6,
              height: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }}
          />
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    },
  );
}
