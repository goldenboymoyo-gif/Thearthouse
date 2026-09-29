import Section from './Section';
import CTA from './CTA';
import Gallery from './Gallery';
import { GALLERY } from '@/lib/site';

export default function GallerySection({ limit, headingLevel, alt = true }) {
  return (
    <Section id="gallery" title={GALLERY.title} alt={alt} headingLevel={headingLevel}>
      <Gallery images={GALLERY.images} limit={limit} />
      {limit ? <CTA href="/gallery">View Full Gallery</CTA> : null}
    </Section>
  );
}
