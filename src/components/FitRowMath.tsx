/**
 * Show-your-work expander for a fit-row. Uses `<details>` so it works
 * without any client-side state. Rendered below the parent fit-row.
 */
export interface FitRowMathProps {
  math: string;
}

export default function FitRowMath({ math }: FitRowMathProps) {
  return (
    <details
      style={{
        padding: '0 20px 12px',
        borderTop: '1px dashed var(--line)',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '8px 0',
          listStyle: 'none',
          userSelect: 'none',
        }}
      >
        ▸ show the math
      </summary>
      <pre
        style={{
          margin: '4px 0 8px',
          padding: '14px 16px',
          backgroundColor: 'var(--bg)',
          border: '1px solid var(--line)',
          color: 'var(--text)',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          lineHeight: 1.6,
          overflowX: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {math}
      </pre>
    </details>
  );
}
