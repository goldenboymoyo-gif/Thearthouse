'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';
import Chatbot from './Chatbot';

// Bottom-right corner: The Art House Assistant (chatbot) and, once the page
// has been scrolled, the back-to-top button.
export default function FloatingButtons() {
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
        <div className="chat-launcher">
          <span className="chat-launcher-label" aria-hidden="true">
            <span className="chat-launcher-dot" />
            <span className="chat-launcher-text">
              <span>Need help?</span>
              <strong>Ask The Art House Assistant</strong>
            </span>
          </span>
          <Chatbot />
        </div>
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
