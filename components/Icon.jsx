import { icon } from '@/lib/assets';

// Draws one of the Site123 SVG icons the live site uses, tinted with the
// current text colour (the same mask technique the original site uses).
export default function Icon({ name, className = '', style, label }) {
  const url = `url(${icon(name)})`;
  return (
    <span
      className={`icon ${className}`}
      style={{ WebkitMaskImage: url, maskImage: url, ...style }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
