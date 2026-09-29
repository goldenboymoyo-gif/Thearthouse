'use client';

import { useState } from 'react';
import Lightbox from './Lightbox';

// "What to do in Vic Falls" photographs: square tiles, three to a row, with
// a 1px frame, opening in the full-screen viewer.
export default function ActivityTiles({ images, limit }) {
  const [open, setOpen] = useState(null);
  const list = limit ? images.slice(0, limit) : images;
  return (
    <>
      <div className="tiles">
        {list.map((im, i) => (
          <div className="tile" key={im.src}>
            <button
              type="button"
              style={{ backgroundImage: `url(${im.src})` }}
              onClick={() => setOpen(i)}
              aria-label={`Open activity photo ${i + 1} of ${list.length}`}
            />
          </div>
        ))}
      </div>
      {open !== null ? <Lightbox images={list} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
