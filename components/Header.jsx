'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAV, SITE } from '@/lib/site';
import { isActive, useChrome } from './chrome-context';
import SmartImage from './SmartImage';

// Desktop header: logo, five plain page links (no dropdown menus) and the
// Book Now button. The bar shrinks with a shadow once the page is scrolled.
export default function Header() {
  const { pathname } = useChrome();
  const inside = pathname !== '/';
  const [affix, setAffix] = useState(false);

  useEffect(() => {
    const threshold = inside ? 80 : 1;
    const onScroll = () => setAffix(window.scrollY >= threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [inside]);

  return (
    <nav
      className={`site-header ${inside ? 'is-inside' : ''} ${affix ? 'is-affix' : ''}`}
      aria-label="Main navigation"
    >
      <div className="nav-inner">
        <Link href="/" className="site-logo" aria-label={SITE.name}>
          <SmartImage src={SITE.logo} alt={SITE.name} sizes="(max-width: 1199px) 100px, 120px" priority />
        </Link>

        <div className="nav-pages-wrap">
          <ul className="nav-pages">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive(pathname, item.href, item.match) ? 'active' : ''}`}
                >
                  <span className="txt">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="nav-actions">
          <a className="btn btn-nav" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
            Book Now
          </a>
        </div>
      </div>
    </nav>
  );
}
