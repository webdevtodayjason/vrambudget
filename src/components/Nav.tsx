import Link from 'next/link';

type NavActive = 'calculator' | 'math' | 'gpus' | 'models' | null;

export type NavProps = { active?: NavActive };

const GITHUB_URL = 'https://github.com/webdevtodayjason/vrambudget';
const DEFAULT_GPU_HREF = '/gpu/rtx-4090';
const DEFAULT_MODEL_HREF = '/model/llama-3-1-70b';

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
          <Link href="/#calculator" className={cls('calculator')}>
            Calculator
          </Link>
          <Link href="/the-math" className={cls('math')}>
            The math
          </Link>
          <Link href={DEFAULT_GPU_HREF} className={cls('gpus')}>
            GPUs
          </Link>
          <Link href={DEFAULT_MODEL_HREF} className={cls('models')}>
            Models
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
      </div>
    </nav>
  );
}
