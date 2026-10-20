import Link from 'next/link';
import SmartImage from '../SmartImage';
import SectionHeading from '../SectionHeading';
import { img } from '@/lib/assets';

const PHOTOS = [
  { file: 'ah-2980.jpg', alt: 'Veranda lounge with ceiling fans at The Art House', cls: 'big' },
  { file: 'ah-2775.jpg', alt: 'King bedroom opening onto the garden at The Art House' },
  { file: 'ah-3037.jpg', alt: 'Outdoor shower in the garden', cls: 'tall' },
  { file: 'ah-3010.jpg', alt: 'Private swimming pool with loungers' },
];

// A photo mosaic instead of a long gallery: four pictures and a link to all of them.
export default function HomeMosaic() {
  return (
    <section className="s-module home-mosaic">
      <SectionHeading title="Inside The Art House" />
      <div className="container" data-aos="fade-up">
        <div className="mosaic">
          {PHOTOS.map((p) => (
            <Link key={p.file} href="/gallery" className={`mosaic-item ${p.cls || ''}`} aria-label={`${p.alt}, view the gallery`}>
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
