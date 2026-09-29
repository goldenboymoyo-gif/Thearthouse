'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const OFFSET = 120; // px — the AOS default the live site uses
const SHIFT = 100; // px — "fade-up" start position

// Recreates the live site's AOS "fade-up" scroll animation (200ms, ease):
// an element fades in and rises into place once its top passes 120px above
// the bottom of the window, and resets when scrolled back below that point.
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let els = [];
    let frame = 0;

    const check = () => {
      frame = 0;
      const trigger = window.innerHeight - OFFSET;
      for (const el of els) {
        const animated = el.classList.contains('aos-animate');
        const top = el.getBoundingClientRect().top - (animated ? 0 : SHIFT);
        if (top < trigger) {
          if (!animated) el.classList.add('aos-animate');
        } else if (animated) {
          el.classList.remove('aos-animate');
        }
      }
    };

    const scan = () => {
      els = [...document.querySelectorAll('[data-aos]')];
      check();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    scan();
    root.classList.add('aos-ready');
    const t = setTimeout(scan, 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
