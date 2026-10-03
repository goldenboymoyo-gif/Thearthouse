'use client';

import { useState } from 'react';
import Lightbox from './Lightbox';
import SmartImage from './SmartImage';

// Full-width photographs of an Outdoor Living page, opening in the viewer.
export default function PortfolioImages({ images, alt }) {
  const [open, setOpen] = useState(null);
  const list = images.map((im) => ({ ...im, full: im.src, alt }));
  return (
    <>
      {list.map((im, i) => (
        <button type="button" className="p-image" key={im.src} onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`}>
          <SmartImage src={im.src} alt={alt} style={{ aspectRatio: String(im.ratio) }} sizes="(max-width: 767px) 92vw, 30vw" priority={i === 0} />
        </button>
      ))}
      {open !== null ? <Lightbox images={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
