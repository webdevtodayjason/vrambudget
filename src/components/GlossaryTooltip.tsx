import Link from 'next/link';
import type { ReactNode, CSSProperties } from 'react';

import { termBySlug } from '@/lib/glossary';

export interface GlossaryTooltipProps {
  /** Glossary slug (matches src/lib/glossary.ts). */
  slug: string;
  /** Display text. Falls back to the term name if children isn't provided. */
  children?: ReactNode;
  /** Variant: 'inline' (dotted-underline link) or 'label' (subtle dim chip). */
  variant?: 'inline' | 'label';
  style?: CSSProperties;
}

/**
 * Renders a glossary-linked term: dotted-underline link with the one-liner as
 * a native browser tooltip; clicking jumps to /glossary#<slug>.
 *
 * Two variants:
 *   inline: for body copy (dotted underline matching the text color)
 *   label:  for slider/stat labels (the term renders dim, but hover highlights
 *           and the cursor changes to indicate clickability)
 *
 * The tooltip copy is sourced from src/lib/glossary.ts so edits propagate.
 */
export default function GlossaryTooltip({
  slug,
  children,
  variant = 'inline',
  style,
}: GlossaryTooltipProps) {
  const term = termBySlug(slug);
  const label = children ?? term?.term ?? slug;

  if (variant === 'label') {
    return (
      <Link
        href={`/glossary#${slug}`}
        title={term?.oneLiner}
        style={{
          color: 'inherit',
          textDecoration: 'none',
          cursor: 'help',
          borderBottom: '1px dotted var(--text-faint)',
          ...style,
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={`/glossary#${slug}`}
      title={term?.oneLiner}
      style={{
        color: 'inherit',
        borderBottom: '1px dotted var(--text-faint)',
        textDecoration: 'none',
        ...style,
      }}
    >
      {label}
    </Link>
  );
}
