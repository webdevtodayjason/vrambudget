'use client';

import { useEffect, useRef } from 'react';

export type GiscusCategory = 'General' | 'Q&A' | 'Ideas' | 'Show and tell';

const CATEGORY_IDS: Record<GiscusCategory, string> = {
  General: 'DIC_kwDOSjhKos4C9ih_',
  'Q&A': 'DIC_kwDOSjhKos4C9iiA',
  Ideas: 'DIC_kwDOSjhKos4C9iiB',
  'Show and tell': 'DIC_kwDOSjhKos4C9iiC',
};

export interface GiscusCommentsProps {
  /** Which Discussions category to mirror into. Defaults to "Q&A". */
  category?: GiscusCategory;
}

/**
 * Giscus-backed comments mounted on a route. Each unique pathname gets its own
 * discussion thread (via data-mapping="pathname"). Discussions are mirrored
 * into the repo's GitHub Discussions tab; visitors need a GitHub account to
 * post, which keeps spam near zero with no moderation infrastructure on our
 * side.
 *
 * Setup requirement: the giscus app must be installed on the repo via
 * https://github.com/apps/giscus. README documents this.
 */
export default function GiscusComments({
  category = 'Q&A',
}: GiscusCommentsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-repo', 'webdevtodayjason/vrambudget');
    script.setAttribute('data-repo-id', 'R_kgDOSjhKog');
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', CATEGORY_IDS[category]);
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark_dimmed');
    script.setAttribute('data-lang', 'en');
    script.setAttribute('data-loading', 'lazy');
    mount.appendChild(script);

    return () => {
      mount.innerHTML = '';
    };
  }, [category]);

  return (
    <section>
      <div className="container">
        <div className="section-head">
          <h2>Discussion.</h2>
          <div className="right">$ gh discussion list</div>
        </div>
        <p
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginTop: 0,
            marginBottom: 24,
          }}
        >
          {'// '}sign in with github to leave a comment. threads live in the
          repo&apos;s discussions tab.
        </p>
        <div
          ref={ref}
          style={{
            border: '1px solid var(--line)',
            padding: 24,
            marginBottom: 64,
            minHeight: 200,
            backgroundColor: 'var(--bg-elev)',
          }}
        />
      </div>
    </section>
  );
}
