'use client';

import { useEffect, useState } from 'react';
import { GREETING, SITE } from '@/lib/site';
import Icon from './Icon';
import Chatbot from './Chatbot';
import { useChrome } from './chrome-context';

// Bottom-right buttons of the live site: share (green) and the AI assistant
// chatbot (green), the welcome message, the scroll-to-top button, and on
// phones the green chatbot button along the bottom of the screen.
export default function FloatingButtons() {
  const { setOpen, pathname } = useChrome();
  const [shareOpen, setShareOpen] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem('ah-greeting-closed') === '1';
    } catch {}
    if (dismissed) return undefined;
    const t = setTimeout(() => setGreeting(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setShareOpen(false), [pathname]);

  const closeGreeting = () => {
    setGreeting(false);
    try {
      sessionStorage.setItem('ah-greeting-closed', '1');
    } catch {}
  };

  const openContact = () => {
    closeGreeting();
    setOpen('email');
  };

  const pageUrl = () => (typeof window !== 'undefined' ? window.location.href : SITE.url);

  const shareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl())}`;
    window.open(url, 'share', 'width=600,height=500,noopener');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <>
      <div className="magic-buttons">
        <div className={`share-list ${shareOpen ? 'open' : ''}`}>
          <button type="button" className="fb" onClick={shareFacebook} aria-label="Share on Facebook" tabIndex={shareOpen ? 0 : -1}>
            <Icon name="facebook" />
          </button>
          <button type="button" onClick={copyLink} aria-label="Copy link" tabIndex={shareOpen ? 0 : -1} style={{ position: 'relative' }}>
            <Icon name="clone" />
            {copied ? <span className="share-copied">Link copied</span> : null}
          </button>
        </div>
        <button
          type="button"
          className="magic-btn share"
          onClick={() => setShareOpen((v) => !v)}
          aria-label={shareOpen ? 'Close share options' : 'Share'}
          aria-expanded={shareOpen}
        >
          {shareOpen ? <Icon name="times" className="close-icon" /> : <Icon name="share-alt" />}
        </button>
        <Chatbot />
        <div className={`greeting ${greeting ? 'open' : ''}`} role="status" aria-hidden={!greeting}>
          <div className="greeting-head">
            <button type="button" onClick={closeGreeting} aria-label="Close message" tabIndex={greeting ? 0 : -1}>
              <Icon name="times" />
            </button>
          </div>
          <div className="greeting-body">
            <p>{GREETING}</p>
            <button type="button" onClick={openContact} aria-label="Contact us" tabIndex={greeting ? 0 : -1}>
              <Icon name="envelope" />
            </button>
          </div>
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
