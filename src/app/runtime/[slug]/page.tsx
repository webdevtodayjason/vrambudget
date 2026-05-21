import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { RUNTIMES, runtimeBySlug, otherRuntimes } from '@/lib/runtimes';

type Params = { slug: string };

export async function generateStaticParams() {
  return RUNTIMES.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = runtimeBySlug(slug);
  if (!r) {
    return { title: { absolute: 'Not found · vrambudget' } };
  }
  return {
    title: { absolute: `${r.name} — vrambudget` },
    description: r.oneLiner,
    alternates: {
      types: { 'text/agent-view': `/runtime/${slug}.agent` },
    },
  };
}

export const dynamic = 'force-static';

export default async function RuntimeDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const r = runtimeBySlug(slug);
  if (!r) {
    notFound();
  }

  const siblings = otherRuntimes(slug, 4);

  return (
    <>
      <Nav active="runtimes" />

      <section className="detail-hero">
        <div className="container">
          <div className="crumb">
            <Link href="/">~</Link>
            <span className="sep">/</span>
            <Link href="/runtime/">runtime</Link>
            <span className="sep">/</span>
            <span style={{ color: 'var(--text)' }}>{r.slug}</span>
          </div>
          <h1>{r.name}</h1>
          <p className="summary">{r.oneLiner}</p>
          <div className="detail-stats">
            <div className="detail-stat">
              <div className="k">License</div>
              <div className="v" style={{ fontSize: 16 }}>
                {r.license}
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Platform</div>
              <div className="v" style={{ fontSize: 14, lineHeight: 1.3 }}>
                {r.primaryPlatform}
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">Model formats</div>
              <div className="v" style={{ fontSize: 14, lineHeight: 1.3 }}>
                {r.modelFormats.join(' · ')}
              </div>
            </div>
            <div className="detail-stat">
              <div className="k">API</div>
              <div className="v" style={{ fontSize: 14, lineHeight: 1.3 }}>
                {r.apiCompat.join(' · ')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>What it is.</h2>
            <div className="right">$ ./vrambudget --runtime {r.slug}</div>
          </div>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              color: 'var(--text)',
              maxWidth: 800,
              marginBottom: 64,
            }}
          >
            {r.summary}
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Install.</h2>
            <div className="right">$ pkg install {r.slug}</div>
          </div>
          <div
            style={{
              border: '1px solid var(--line)',
              padding: '20px 24px',
              fontFamily: 'var(--mono)',
              fontSize: 14,
              color: 'var(--text)',
              backgroundColor: 'var(--bg)',
              marginBottom: 16,
              overflowX: 'auto',
            }}
          >
            {r.installCommand}
          </div>
          {r.installSecondary ? (
            <div
              style={{
                border: '1px solid var(--line)',
                padding: '20px 24px',
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--text-dim)',
                backgroundColor: 'var(--bg)',
                marginBottom: 24,
                overflowX: 'auto',
              }}
            >
              {r.installSecondary}
            </div>
          ) : null}
          <p
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 64,
            }}
          >
            Supported platforms: {r.platforms.join(', ')}
          </p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Features.</h2>
            <div className="right">$ cat features.md</div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 64,
            }}
          >
            {r.features.map((f, idx) => (
              <div
                key={f.label}
                style={{
                  padding: '24px 28px',
                  borderRight: `${idx % 2 === 0 ? '1px' : '0'} solid var(--line)`,
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 10,
                  }}
                >
                  {f.label}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--text)',
                    margin: 0,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 64,
              marginTop: 24,
            }}
          >
            <div
              style={{
                padding: '24px 28px 28px',
                borderRight: '1px solid var(--line)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--green)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 14,
                }}
              >
                Best for
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {r.bestFor.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'var(--text)',
                      paddingLeft: 16,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--green)',
                      }}
                    >
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: '24px 28px 28px' }}>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--yellow)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 14,
                }}
              >
                Caveats
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {r.caveats.map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'var(--text-dim)',
                      paddingLeft: 16,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--yellow)',
                      }}
                    >
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Links.</h2>
            <div className="right">$ ls -1 ./external</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              border: '1px solid var(--line)',
              marginBottom: 64,
            }}
          >
            <a
              href={r.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <span>↗ homepage</span>
              <span style={{ color: 'var(--accent)' }}>{r.homepageUrl}</span>
            </a>
            <a
              href={r.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--line)',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <span>↗ github</span>
              <span style={{ color: 'var(--accent)' }}>{r.githubUrl}</span>
            </a>
            <a
              href={r.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--text)',
                textDecoration: 'none',
              }}
            >
              <span>↗ docs</span>
              <span style={{ color: 'var(--accent)' }}>{r.docsUrl}</span>
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <h2>Compare to…</h2>
            <div className="right">$ ./vrambudget --compare-runtimes</div>
          </div>
          <div className="compare">
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/runtime/${s.slug}/`}
                className="compare-card"
              >
                <span className="arrow">$ alt</span>
                <span className="name">{s.name}</span>
                <span
                  className="v"
                  style={{
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--mono)',
                    lineHeight: 1.4,
                  }}
                >
                  {s.badge}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {s.primaryPlatform}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer route={`/runtime/${slug}`} />
    </>
  );
}
