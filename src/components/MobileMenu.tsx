'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Hamburger trigger + slide-down drawer for narrow viewports.
 * Visible only via CSS at <720px; desktop nav-links handle everything wider.
 * Drawer auto-closes on route change.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <button
        type="button"
        className="mobile-menu-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mobile-menu-bar" />
        <span className="mobile-menu-bar" />
        <span className="mobile-menu-bar" />
      </button>

      {open && (
        <div
          className="mobile-menu-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <Link href="/calc/" className={isActive('/calc') ? 'active' : undefined}>
            Calculator
          </Link>
          <Link href="/learn/" className={isActive('/learn') ? 'active' : undefined}>
            Learn
          </Link>
          <Link href="/the-math" className={pathname === '/the-math' || pathname === '/the-math/' ? 'active' : undefined}>
            The math
          </Link>
          <Link href="/glossary/" className={isActive('/glossary') ? 'active' : undefined}>
            Glossary
          </Link>
          <Link href="/gpu/" className={isActive('/gpu') ? 'active' : undefined}>
            GPUs
          </Link>
          <Link href="/model/" className={isActive('/model') ? 'active' : undefined}>
            Models
          </Link>
          <Link href="/runtime/" className={isActive('/runtime') ? 'active' : undefined}>
            Runtimes
          </Link>
          <a
            href="https://github.com/webdevtodayjason/vrambudget"
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-menu-cta"
          >
            ↗ GitHub
          </a>
        </div>
      )}
    </>
  );
}
