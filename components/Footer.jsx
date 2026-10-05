'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_PAGES, CONTACT, SITE } from '@/lib/site';
import Icon from './Icon';
import { isActive } from './chrome-context';

// Footer: name and copyright on the left; every page as a plain link and the
// social buttons on the right.
export default function Footer() {
  const pathname = usePathname();
  if (pathname && pathname.startsWith('/admin')) return null;

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
              {ALL_PAGES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={`nav-link ${isActive(pathname, item.href) ? 'active' : ''}`}>
                    <span className="txt">{item.label}</span>
                  </Link>
                </li>
              ))}
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
