'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import { useChrome } from './chrome-context';

// Bottom-right corner: a "Contact us" email button that opens the contact
// form popup and, once the page has been scrolled, the back-to-top button.
export default function FloatingButtons() {
  const { setOpen } = useChrome();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="magic-buttons">
        <button
          type="button"
          className="magic-btn chat"
          onClick={() => setOpen('email')}
          aria-label="Contact us by email"
          title="Contact us"
        >
          <Icon name="envelope" />
        </button>
      </div>

      <button
        type="button"
        className={`goto-top ${showTop ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <Icon name="angle-up" />
      </button>
    </>
  );
}
