'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';
import Icon from './Icon';
import { useChrome } from './chrome-context';
import SmartImage from './SmartImage';

// Phone-size header of the live site: menu button left, logo centred, phone
// and email buttons right.
export default function MobileHeader() {
  const { setOpen } = useChrome();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`mobile-header ${scrolled ? 'is-scrolled' : ''}`} aria-label="Mobile navigation">
      <div className="m-side">
        <button type="button" className="m-btn bars" onClick={() => setOpen('menu')} aria-label="Open menu">
          <Icon name="bars" />
        </button>
      </div>
      <Link href="/" className="site-logo" aria-label={SITE.name}>
        <SmartImage src={SITE.logo} alt={SITE.name} sizes="90px" loading="eager" />
      </Link>
      <div className="m-side right">
        <button type="button" className="m-btn" onClick={() => setOpen('phone')} aria-label="Call us">
          <Icon name="phone" />
        </button>
        <button type="button" className="m-btn" onClick={() => setOpen('email')} aria-label="Email us">
          <Icon name="envelope" />
        </button>
      </div>
    </nav>
  );
}
