'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NAV, SITE } from '@/lib/site';
import Icon from './Icon';
import { isActive, useChrome } from './chrome-context';

// Desktop header. The primary navigation is fixed to the five main links,
// with "The Art House" and "Explore" opening dropdown menus. The logo, the
// centered links and the Book Now button are the same as on the live site.
export default function Header() {
  const { pathname } = useChrome();
  const inside = pathname !== '/';
  const [affix, setAffix] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const threshold = inside ? 80 : 1;
    const onScroll = () => setAffix(window.scrollY >= threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [inside]);

  useEffect(() => setOpenMenu(null), [pathname]);

  useEffect(() => {
    if (openMenu === null) return undefined;
    const onDoc = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const menuActive = useCallback(
    (item) => (item.dropdown ? item.dropdown.some((child) => isActive(pathname, child.href)) : false),
    [pathname]
  );

  return (
    <nav
      className={`site-header ${inside ? 'is-inside' : ''} ${affix ? 'is-affix' : ''}`}
      aria-label="Main navigation"
    >
      <div className="nav-inner">
        <Link href="/" className="site-logo" aria-label={SITE.name}>
          <img src={SITE.logo} alt={SITE.name} width="382" height="213" />
        </Link>

        <div className="nav-pages-wrap">
          <ul className="nav-pages" ref={navRef}>
            {NAV.map((item, index) =>
              item.dropdown ? (
                <li
                  key={item.label}
                  className={`nav-more has-dropdown ${openMenu === index ? 'open' : ''}`}
                  onMouseEnter={() => setOpenMenu(index)}
                  onMouseLeave={() => setOpenMenu((v) => (v === index ? null : v))}
                >
                  <button
                    type="button"
                    className={`nav-link ${menuActive(item) ? 'active' : ''}`}
                    aria-haspopup="true"
                    aria-expanded={openMenu === index}
                    onClick={() => setOpenMenu((v) => (v === index ? null : index))}
                  >
                    <span className="txt">{item.label}</span>
                    <Icon name="caret-down" className="caret" />
                  </button>
                  <ul className="nav-dropdown" aria-label={item.label}>
                    {item.dropdown.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className={isActive(pathname, child.href) ? 'active' : ''}
                          onClick={() => setOpenMenu(null)}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href} className={`nav-link ${isActive(pathname, item.href) ? 'active' : ''}`}>
                    <span className="txt">{item.label}</span>
                  </Link>
                </li>
              )
            )}
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