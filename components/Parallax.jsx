'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { imgDims } from '@/lib/assets';

// Background image parallax, reproducing the parallax.js behaviour the live
// Site123 site uses for the top image and the promo banners (speed 0.2).
// The photograph is served through next/image (responsive srcset, modern
// formats, optionally preloaded) and the aspect ratio comes from the build-time
// dimension map, so the browser no longer downloads a second copy of the image
// just to measure it. Touch devices get a static cover image, as on the live
// site, and the image is hidden from assistive technology because the same
// scene is described by the page's heading and text.
export default function Parallax({ src, opacity = 1, speed = 0.2, priority = false, sizes = '100vw' }) {
  const boxRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const box = boxRef.current;
    const el = imgRef.current;
    if (!box || !el) return;

    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (touch || reduce) return;

    const { width, height } = imgDims(String(src || '').split('/').pop());
    let ratio = width / height;
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

    refresh();

    const ro = new ResizeObserver(() => refresh());
    ro.observe(document.body);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', refresh);
      if (frame) cancelAnimationFrame(frame);
      el.style.cssText = `width:100%;height:100%;transform:none;opacity:${opacity}`;
    };
  }, [src, speed, opacity]);

  return (
    <div className="parallax" ref={boxRef} aria-hidden="true">
      <div ref={imgRef} className="parallax-img" style={{ opacity }}>
        <Image src={src} alt="" fill priority={priority} sizes={sizes} style={{ objectFit: 'cover' }} />
      </div>
    </div>
  );
}
