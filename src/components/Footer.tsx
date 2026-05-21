import Link from 'next/link';
import AvlBadge from './AvlBadge';

export type FooterProps = { route: string; lastBuilt?: string };

function todayIso(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function Footer({ route, lastBuilt }: FooterProps) {
  const built = lastBuilt ?? todayIso();

  return (
    <footer>
      <div className="container">
        <div
          className="foot-avl"
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '32px 0 16px',
            borderBottom: '1px solid var(--line)',
          }}
        >
          <AvlBadge route={route} />
        </div>
        <div className="foot-bottom">
          <span>
            <Link href="/">← back to homepage</Link>
          </span>
          <span>{`$ ${route} · last built ${built}`}</span>
        </div>
      </div>
    </footer>
  );
}
