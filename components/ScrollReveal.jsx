'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Recreates the live site's AOS "fade-up" scroll animation (200ms, ease):
// an element fades in and rises into place once its top passes 120px above
// the bottom of the window, and resets when scrolled back below that point.
// IntersectionObserver is used so nothing has to be measured on every scroll
// frame, which previously forced a layout per element and blocked input.
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    let observer = null;

    // IntersectionObserver keeps this off the main thread: the previous version
    // read getBoundingClientRect() for every animated element on every scroll
    // frame, which forced a layout on each one and blocked interaction.
    const scan = () => {
      if (observer) observer.disconnect();
      const els = [...document.querySelectorAll('[data-aos]')];
      if (!els.length) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target;
            if (entry.isIntersecting) {
              el.classList.add('aos-animate');
            } else if (entry.boundingClientRect.top > 0) {
              el.classList.remove('aos-animate');
            }
          }
        },
        { rootMargin: '0px 0px -120px 0px', threshold: 0 }
      );
      for (const el of els) observer.observe(el);
    };

    scan();
    root.classList.add('aos-ready');
    const t = setTimeout(scan, 300);
    return () => {
      clearTimeout(t);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  return null;
}
