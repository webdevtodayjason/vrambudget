import {
  SiNvidia,
  SiAmd,
  SiIntel,
  SiApple,
  SiMeta,
  SiGoogle,
  SiHuggingface,
  SiOllama,
  SiAlibabacloud,
  SiMistralai,
} from '@icons-pack/react-simple-icons';
import type { CSSProperties } from 'react';

export interface BrandLogoProps {
  /** Brand key. Use the helpers in src/lib/brand-map.ts. */
  brand: string;
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
  style?: CSSProperties;
}

type IconCmp = (props: { size?: number; color?: string; title?: string }) => JSX.Element;

const ICON_MAP: Record<string, IconCmp> = {
  nvidia: SiNvidia as unknown as IconCmp,
  amd: SiAmd as unknown as IconCmp,
  intel: SiIntel as unknown as IconCmp,
  apple: SiApple as unknown as IconCmp,
  meta: SiMeta as unknown as IconCmp,
  google: SiGoogle as unknown as IconCmp,
  huggingface: SiHuggingface as unknown as IconCmp,
  ollama: SiOllama as unknown as IconCmp,
  alibabacloud: SiAlibabacloud as unknown as IconCmp,
  mistral: SiMistralai as unknown as IconCmp,
};

// Brands without official simple-icons entries get a text-mark fallback.
// Displayed in the same accent color so the visual cadence stays consistent.
const TEXT_FALLBACK: Record<string, string> = {
  microsoft: 'Microsoft',
  openai: 'OpenAI',
  ibm: 'IBM',
  cohere: 'Cohere',
  deepseek: 'DeepSeek',
  '01-ai': '01.AI',
  bigcode: 'BigCode',
  'lm-studio': 'LM Studio',
  vllm: 'vLLM',
  mlx: 'MLX',
  omlx: 'oMLX',
};

/**
 * Renders a brand mark for a manufacturer / provider / runtime.
 * Falls back to a small text chip when the brand isn't in simple-icons.
 */
export default function BrandLogo({
  brand,
  size = 18,
  color = 'var(--accent)',
  className,
  ariaLabel,
  style,
}: BrandLogoProps) {
  const Icon = ICON_MAP[brand];
  if (Icon) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color,
          ...style,
        }}
        aria-label={ariaLabel ?? brand}
      >
        <Icon size={size} color={color} title={ariaLabel ?? brand} />
      </span>
    );
  }

  const text = TEXT_FALLBACK[brand];
  if (text) {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontFamily: 'var(--mono)',
          fontSize: Math.max(10, Math.round(size * 0.58)),
          color,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '2px 7px',
          border: `1px solid ${color}`,
          lineHeight: 1,
          ...style,
        }}
        aria-label={ariaLabel ?? brand}
      >
        {text}
      </span>
    );
  }

  return null;
}
