'use client';

import { useEffect, useRef } from 'react';

// Background image parallax, reproducing the parallax.js behaviour the live
// Site123 site uses for the top image and the promo banners (speed 0.2).
// Touch devices get a static cover image, as on the live site.
export default function Parallax({ src, opacity = 1, speed = 0.2 }) {
  const boxRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const el = imgRef.current;
    if (!box || !el) return;

    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (touch || reduce) return;

    let ratio = 0;
    let geo = null;
    let frame = 0;

    const refresh = () => {
      if (!ratio) return;
      const rect = box.getBoundingClientRect();
      const boxTop = rect.top + window.scrollY;
      const boxH = box.offsetHeight;
      const boxW = box.offsetWidth;
      const winH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;
      const maxOffset = Math.min(boxTop, docH - winH);
      const minOffset = Math.max(boxTop + boxH - winH, 0);
      const imageHeightMin = boxH + (maxOffset - minOffset) * (1 - speed);
      const imageOffsetMin = (boxTop - maxOffset) * (1 - speed);
      let w;
      let h;
      let left;
      let baseTop;
      if (imageHeightMin * ratio >= boxW) {
        w = imageHeightMin * ratio;
        h = imageHeightMin;
        left = (boxW - w) / 2;
        baseTop = imageOffsetMin;
      } else {
        w = boxW;
        h = boxW / ratio;
        left = 0;
        baseTop = imageOffsetMin - (h - imageHeightMin) / 2;
      }
      geo = { boxTop, w, h, left, baseTop };
      el.style.width = `${Math.ceil(w)}px`;
      el.style.height = `${Math.ceil(h)}px`;
      render();
    };

    const render = () => {
      frame = 0;
      if (!geo) return;
      const mirrorTop = geo.boxTop - window.scrollY;
      const top = geo.baseTop - mirrorTop * (1 - speed);
      el.style.transform = `translate3d(${geo.left}px, ${top}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const probe = new Image();
    probe.onload = () => {
      ratio = probe.naturalWidth / probe.naturalHeight;
      refresh();
    };
    probe.src = src;

    const ro = new ResizeObserver(() => refresh());
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refresh);
      if (frame) cancelAnimationFrame(frame);
      el.style.cssText = `background-image:url(${src});opacity:${opacity}`;
    };
  }, [src, speed, opacity]);

  return (
    <div className="parallax" ref={boxRef} aria-hidden="true">
      <div ref={imgRef} className="parallax-img" style={{ backgroundImage: `url(${src})`, opacity }} />
    </div>
  );
}
