import Image from 'next/image';
import { imgDims } from '@/lib/assets';

// Drop-in replacement for <img> that routes every photograph through the
// next/image optimizer: modern formats, responsive srcset, lazy loading and an
// exact width/height so nothing shifts while images load (CLS = 0).
export default function SmartImage({ src, alt = '', sizes = '100vw', priority = false, className, style, ...rest }) {
  const file = String(src || '').split('/').pop();
  const { width, height } = imgDims(file);
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      {...rest}
    />
  );
}
