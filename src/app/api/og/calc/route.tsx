import { ImageResponse } from 'next/og';
import { NextResponse } from 'next/server';

import { resolveCalcParams } from '@/lib/og-calc';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BG = '#0A0A0A';
const TEXT = '#E8E6E1';
const DIM = '#8A8783';
const FAINT = '#555149';
const ACCENT = '#FFA947';
const LINE = '#1F1F1F';

// Render an OG card that visually mirrors the calculator's budget bar +
// the current configuration. The URL is the API — every share gets a
// preview that matches what the recipient will see when they click.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw: Record<string, string> = {};
  for (const [k, v] of url.searchParams.entries()) raw[k] = v;
  const cfg = resolveCalcParams(raw);

  // Visualize the budget bar segment widths as fractions of 1000 pixels.
  const totalPx = 1000;
  const total = cfg.budget.total;
  const weightsPx = Math.max(0, Math.round((cfg.budget.weightsBudget / total) * totalPx));
  const kvPx = Math.max(0, Math.round((cfg.budget.kvCache / total) * totalPx));
  const overheadPx = Math.max(0, Math.round((cfg.budget.framework / total) * totalPx));
  const safetyPx = Math.max(0, Math.round((cfg.budget.safety / total) * totalPx));

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
          padding: '56px 72px 48px',
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
          <span>/calc</span>
        </div>

        {/* Hero: GPU + context */}
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 22,
              color: DIM,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {`${cfg.gpu.name} · ${cfg.gpu.vramGB} GB · ctx ${cfg.contextLabel} · conc ${cfg.concurrency} · ${cfg.safety}% safety`}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 88,
              color: ACCENT,
              letterSpacing: '-0.04em',
              lineHeight: 1.0,
              marginTop: 18,
              display: 'flex',
              alignItems: 'baseline',
              gap: 16,
            }}
          >
            <span>{cfg.weightsBudget.toFixed(1)}</span>
            <span style={{ fontSize: 36, color: DIM }}>GB</span>
            <span style={{ fontSize: 30, color: FAINT, marginLeft: 14 }}>
              for weights
            </span>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 22,
              color: TEXT,
              letterSpacing: '-0.01em',
              marginTop: 14,
              display: 'flex',
              gap: 18,
            }}
          >
            <span>{`kv ${cfg.budget.kvCache.toFixed(2)}`}</span>
            <span style={{ color: FAINT }}>·</span>
            <span>{`overhead ${cfg.budget.framework.toFixed(2)}`}</span>
            <span style={{ color: FAINT }}>·</span>
            <span>{`safety ${cfg.budget.safety.toFixed(2)}`}</span>
          </div>
        </div>

        {/* Budget bar visualization */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
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
            <div style={{ width: weightsPx, backgroundColor: ACCENT }} />
            <div
              style={{ width: kvPx, backgroundColor: 'rgba(255,169,71,0.55)' }}
            />
            <div
              style={{
                width: overheadPx,
                backgroundColor: 'rgba(255,169,71,0.28)',
              }}
            />
            <div
              style={{ width: safetyPx, backgroundColor: 'rgba(255,255,255,0.05)' }}
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
                <span>kv</span>
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
      width: 1200,
      height: 630,
      headers: {
        'cache-control': 'public, max-age=300, s-maxage=3600',
        'content-type': 'image/png',
      },
    },
  );
}
