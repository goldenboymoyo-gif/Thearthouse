'use client';

import { useEffect, useMemo, useState } from 'react';
import Icon from './Icon';
import Lightbox from './Lightbox';
import SmartImage from './SmartImage';

// Masonry photo gallery of the live site: three columns with 5px gutters,
// photographs at their natural proportions, green overlay with an eye on
// hover, and the full-screen viewer on click.
export default function Gallery({ images, limit }) {
  const [cols, setCols] = useState(3);
  const [open, setOpen] = useState(null);
  const list = limit ? images.slice(0, limit) : images;

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const apply = () => setCols(mq.matches ? 3 : 1);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const columns = useMemo(() => {
    const out = Array.from({ length: cols }, () => ({ h: 0, items: [] }));
    list.forEach((im, i) => {
      let target = out[0];
      for (const c of out) if (c.h < target.h - 0.001) target = c;
      target.items.push(i);
      target.h += im.height / im.width + 0.02;
    });
    return out;
  }, [list, cols]);

  return (
    <>
      <div className="masonry">
        {columns.map((col, ci) => (
          <div className="masonry-col" key={ci}>
            {col.items.map((i) => {
              const im = list[i];
              return (
                <div className="g-item" key={im.src}>
                  <a
                    className="g-thumb"
                    href={im.full}
                    onClick={(e) => {
                      e.preventDefault();
                      setOpen(i);
                    }}
                    aria-label={`Open photo ${i + 1} of ${list.length}${im.alt ? `: ${im.alt}` : ''}`}
                  >
                    <SmartImage src={im.src} alt={im.alt || ""} sizes="(max-width: 767px) 33vw, 25vw" />
                    <span className="overlay" />
                    <span className="eye">
                      <Icon name="eye" />
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {open !== null ? <Lightbox images={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
