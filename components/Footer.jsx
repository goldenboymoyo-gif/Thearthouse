'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ALL_PAGES, CONTACT, SITE } from '@/lib/site';
import Icon from './Icon';
import { isActive } from './chrome-context';

// Footer of the live site: name and copyright on the left; "Home" and a
// "More" menu that opens upwards, and the social buttons on the right.
export default function Footer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const moreRef = useRef(null);
  const [first, ...rest] = ALL_PAGES;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <div className="footer-side">
            <div className="footer-name">{SITE.name}</div>
            <div>Copyright © {new Date().getFullYear()} All rights reserved</div>
          </div>
          <div className="footer-side right">
            <ul className="footer-nav">
              <li>
                <Link href={first.href} className={`nav-link ${isActive(pathname, first.href) ? 'active' : ''}`}>
                  <span className="txt">{first.label}</span>
                </Link>
              </li>
              <li
                className={`nav-more ${open ? 'open' : ''}`}
                ref={moreRef}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <button type="button" className="nav-link" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
                  <span className="txt">More</span> <Icon name="caret-up" className="caret" />
                </button>
                <ul className="nav-dropdown">
                  {rest.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={isActive(pathname, item.href) ? 'active' : ''}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
            <div className="footer-social">
              <a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Icon name="facebook" />
              </a>
              <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Icon name="instagram" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
