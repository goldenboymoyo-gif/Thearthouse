'use client';

import { useCallback, useEffect, useState } from 'react';

const Chevron = ({ dir }) => (
  <svg viewBox="0 0 32 64" aria-hidden="true">
    <polyline
      points={dir === 'left' ? '26,6 6,32 26,58' : '6,6 26,32 6,58'}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);

// Full-screen image viewer, like the Magnific Popup lightbox of the live
// site: dark overlay, arrows, "1 of 41" counter, keyboard and swipe support.
export default function Lightbox({ images, index, onClose, onIndex }) {
  const [shown, setShown] = useState(false);
  const [touchX, setTouchX] = useState(null);
  const count = images.length;

  const go = useCallback((d) => onIndex((index + d + count) % count), [index, count, onIndex]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    document.body.classList.add('no-scroll');
    return () => {
      cancelAnimationFrame(id);
      document.body.classList.remove('no-scroll');
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  useEffect(() => {
    // preload neighbours
    [1, -1].forEach((d) => {
      const im = new Image();
      im.src = images[(index + d + count) % count].full;
    });
  }, [index, images, count]);

  const current = images[index];

  return (
    <div
      className={`lightbox ${shown ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        setTouchX(null);
      }}
    >
      <figure>
        <button type="button" className="lb-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <img src={current.full} alt={current.alt || ''} onClick={() => count > 1 && go(1)} />
        {count > 1 ? (
          <figcaption className="lb-counter">
            {index + 1} of {count}
          </figcaption>
        ) : null}
      </figure>
      {count > 1 ? (
        <>
          <button type="button" className="lb-arrow lb-prev" onClick={() => go(-1)} aria-label="Previous">
            <Chevron dir="left" />
          </button>
          <button type="button" className="lb-arrow lb-next" onClick={() => go(1)} aria-label="Next">
            <Chevron dir="right" />
          </button>
        </>
      ) : null}
    </div>
  );
}
