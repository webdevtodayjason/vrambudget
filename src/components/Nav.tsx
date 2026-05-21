import Link from 'next/link';

import MobileMenu from './MobileMenu';

type NavActive = 'calculator' | 'math' | 'glossary' | 'learn' | 'gpus' | 'models' | 'runtimes' | null;

export type NavProps = { active?: NavActive };

const GITHUB_URL = 'https://github.com/webdevtodayjason/vrambudget';

export default function Nav({ active = null }: NavProps) {
  const cls = (key: Exclude<NavActive, null>) =>
    active === key ? 'active' : undefined;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">
          <span className="brand-dot" />
          <span>vrambudget</span>
          <span className="brand-slash">/</span>
          <span className="brand-sub">v0.3.1</span>
        </Link>
        <div className="nav-links">
          <Link href="/calc/" className={cls('calculator')}>
            Calculator
          </Link>
          <Link href="/learn/" className={cls('learn')}>
            Learn
          </Link>
          <Link href="/the-math" className={cls('math')}>
            The math
          </Link>
          <Link href="/glossary/" className={cls('glossary')}>
            Glossary
          </Link>
          <Link href="/gpu/" className={cls('gpus')}>
            GPUs
          </Link>
          <Link href="/model/" className={cls('models')}>
            Models
          </Link>
          <Link href="/runtime/" className={cls('runtimes')}>
            Runtimes
          </Link>
          <a
            href={GITHUB_URL}
            className="nav-cta"
            target="_blank"
            rel="noopener"
          >
            ↗ GitHub
          </a>
        </div>
        <MobileMenu />
      </div>
    </nav>
  );
}
