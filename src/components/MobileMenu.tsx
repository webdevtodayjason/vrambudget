'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Hamburger trigger + slide-down drawer for narrow viewports.
 * Visible only via CSS at <720px; desktop nav-links handle everything wider.
 *
 * The drawer is portal-rendered into <body> so it escapes the <nav> element.
 * Why this matters:
 *   - <nav> has position: sticky + backdrop-filter, which makes it a
 *     containing block for absolute/fixed descendants.
 *   - With position:absolute inside the nav, the drawer was anchored to
 *     the nav's *document* position. When the user scrolled down the
 *     page and tapped the hamburger, the drawer rendered 1000+px above
 *     the viewport (invisible until the user scrolled back to the top).
 *   - Portaling to body lets us use position:fixed against the actual
 *     viewport regardless of scroll, while still keeping the toggle
 *     button anchored inside the nav where it belongs.
 *
 * Drawer auto-closes on route change.
 */
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // createPortal requires a real DOM target; gate on mount so SSR doesn't try.
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const drawer = (
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
      <Link
        href="/the-math"
        className={pathname === '/the-math' || pathname === '/the-math/' ? 'active' : undefined}
      >
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
  );

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

      {mounted && open && createPortal(drawer, document.body)}
    </>
  );
}
