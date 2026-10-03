import Link from 'next/link';
import SmartImage from '../SmartImage';
import SectionHeading from '../SectionHeading';
import { img } from '@/lib/assets';

const PHOTOS = [
  { file: '2000_6298dde1bd043.jpg', alt: 'Outdoor dining table on the veranda at sunset', cls: 'big' },
  { file: '2000_6298dda6dad20.jpg', alt: 'King bedroom opening onto the garden at The Art House' },
  { file: '2000_6ab680a390ba3.jpg', alt: 'Private swimming pool with loungers', cls: 'tall' },
  { file: '2000_6298dda94b79a.jpg', alt: 'Lounge with sofas, piano and African art at The Art House' },
];

// A photo mosaic instead of a long gallery: four pictures and a link to all of them.
export default function HomeMosaic() {
  return (
    <section className="s-module home-mosaic">
      <SectionHeading title="Inside The Art House" />
      <div className="container" data-aos="fade-up">
        <div className="mosaic">
          {PHOTOS.map((p) => (
            <Link key={p.file} href="/gallery" className={`mosaic-item ${p.cls || ''}`} aria-label={`${p.alt} – view the gallery`}>
              <SmartImage src={img(p.file)} alt={p.alt} sizes="(max-width: 767px) 92vw, 40vw" />
            </Link>
          ))}
        </div>
        <div className="section-cta">
          <Link className="btn btn-xl btn-outline" href="/gallery">
            View the Gallery
          </Link>
        </div>
      </div>
    </section>
  );
}
