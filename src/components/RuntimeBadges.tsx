import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { ModelRuntimes } from '@/lib/models';

export interface RuntimeBadgesProps {
  runtimes?: ModelRuntimes;
  /** Smaller variant for the model index cards or calc table. */
  compact?: boolean;
  style?: CSSProperties;
}

interface BadgeDef {
  key: keyof ModelRuntimes;
  label: string;
  slug: string;
}

const BADGES: BadgeDef[] = [
  { key: 'ollama', label: 'Ollama', slug: 'ollama' },
  { key: 'lmstudio', label: 'LM Studio', slug: 'lm-studio' },
  { key: 'vllm', label: 'vLLM', slug: 'vllm' },
  { key: 'mlx', label: 'MLX', slug: 'mlx' },
  { key: 'omlx', label: 'oMLX', slug: 'omlx' },
];

/**
 * Renders 5 runtime badges (Ollama / LM Studio / vLLM / MLX / oMLX).
 * Active runtimes are clickable and accent-colored; unsupported are dim
 * and disabled. For Ollama, the tag string is rendered as the badge body
 * if present, so users can copy the exact `ollama run <tag>` command.
 */
export default function RuntimeBadges({
  runtimes,
  compact = false,
  style,
}: RuntimeBadgesProps) {
  const r = runtimes ?? {};
  const fontSize = compact ? 10 : 11;
  const padding = compact ? '3px 7px' : '4px 9px';

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
        ...style,
      }}
    >
      {BADGES.map((b) => {
        const isOllama = b.key === 'ollama';
        const value = r[b.key];
        // For ollama: active iff a string tag is set. For booleans: just truthy.
        const active = isOllama ? typeof value === 'string' && value.length > 0 : !!value;
        const body = isOllama && typeof value === 'string' ? value : b.label;

        const sharedStyle: CSSProperties = {
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'var(--mono)',
          fontSize,
          padding,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          textDecoration: 'none',
          lineHeight: 1,
          border: active
            ? '1px solid var(--accent-line)'
            : '1px solid var(--line)',
          backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-faint)',
          transition: 'border-color 80ms linear, color 80ms linear',
        };

        if (active) {
          return (
            <Link
              key={b.key}
              href={`/runtime/${b.slug}/`}
              style={sharedStyle}
              title={`Open the ${b.label} reference page`}
            >
              {body}
            </Link>
          );
        }

        return (
          <span
            key={b.key}
            style={{
              ...sharedStyle,
              textDecoration: 'line-through',
              textDecorationStyle: 'dotted',
              opacity: 0.6,
            }}
            title={`${b.label}: not supported for this model`}
          >
            {b.label}
          </span>
        );
      })}
    </div>
  );
}
