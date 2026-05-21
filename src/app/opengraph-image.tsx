import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'vrambudget: what LLM fits my hardware?';

// Force static generation so this OG image is pre-rendered at build time
// (compatible with next.config.ts `output: 'export'`). Do NOT add
// `export const runtime = 'edge'` — that breaks static export.
export const dynamic = 'force-static';

// Brand tokens, mirroring globals.css :root.
const BG = '#0A0A0A';
const TEXT = '#E8E6E1';
const DIM = '#8A8783';
const FAINT = '#555149';
const ACCENT = '#FFA947';
const LINE = '#1F1F1F';

// Budget-bar segment widths in px (sum = 600). Matches the calculator's
// visual: dominant weights, then kv, overhead, safety.
const SEG_WEIGHTS = 420;
const SEG_KV = 90;
const SEG_OVERHEAD = 60;
const SEG_SAFETY = 30;

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          color: TEXT,
          padding: '64px 72px',
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.018) 1px, transparent 1px)',
          backgroundSize: '100px 100%',
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: 'monospace',
            fontSize: 22,
            color: DIM,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 14, height: 14, backgroundColor: ACCENT }} />
          <span style={{ color: TEXT, fontWeight: 600 }}>vrambudget</span>
          <span style={{ color: FAINT }}>/</span>
          <span>v0.3.1</span>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 44,
            fontSize: 92,
            lineHeight: 0.96,
            letterSpacing: '-0.035em',
            fontWeight: 600,
            color: TEXT,
            maxWidth: 980,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>What LLM fits</span>
          <span>
            my hardware<span style={{ color: ACCENT }}>?</span>
          </span>
        </div>

        {/* Formula in mono */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'baseline',
            gap: 20,
            fontFamily: 'monospace',
            fontSize: 50,
            color: ACCENT,
            letterSpacing: '-0.02em',
          }}
        >
          <span>VRAM</span>
          <span style={{ color: FAINT }}>~=</span>
          <span>params</span>
          <span style={{ color: TEXT }}>×</span>
          <span>(bits</span>
          <span style={{ color: TEXT }}>÷</span>
          <span>8)</span>
        </div>

        {/* Bottom row: budget bar + legend pushed to the bottom */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            style={{
              display: 'flex',
              height: 22,
              border: `1px solid ${LINE}`,
              backgroundColor: BG,
            }}
          >
            <div style={{ width: SEG_WEIGHTS, backgroundColor: ACCENT }} />
            <div
              style={{ width: SEG_KV, backgroundColor: 'rgba(255,169,71,0.55)' }}
            />
            <div
              style={{
                width: SEG_OVERHEAD,
                backgroundColor: 'rgba(255,169,71,0.28)',
              }}
            />
            <div
              style={{ width: SEG_SAFETY, backgroundColor: 'rgba(255,255,255,0.05)' }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontFamily: 'monospace',
              fontSize: 18,
              color: DIM,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, backgroundColor: ACCENT }} />
                <span>weights</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: 'rgba(255,169,71,0.55)',
                  }}
                />
                <span>kv cache</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: 'rgba(255,169,71,0.28)',
                  }}
                />
                <span>overhead</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: `1px solid ${LINE}`,
                  }}
                />
                <span>safety</span>
              </div>
            </div>
            <span style={{ color: FAINT }}>vrambudget.com</span>
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    },
  );
}
