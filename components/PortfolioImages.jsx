'use client';

import { useState } from 'react';
import Lightbox from './Lightbox';

// Full-width photographs of an Outdoor Living page, opening in the viewer.
export default function PortfolioImages({ images, alt }) {
  const [open, setOpen] = useState(null);
  const list = images.map((im) => ({ ...im, full: im.src, alt }));
  return (
    <>
      {list.map((im, i) => (
        <button type="button" className="p-image" key={im.src} onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}`}>
          <img src={im.src} alt={alt} style={{ aspectRatio: String(im.ratio) }} loading={i ? 'lazy' : 'eager'} />
        </button>
      ))}
      {open !== null ? <Lightbox images={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
