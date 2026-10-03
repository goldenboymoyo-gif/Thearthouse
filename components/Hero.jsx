import Link from 'next/link';
import Parallax from './Parallax';
import Shape from './Shape';
import { HERO_IMAGE, SITE } from '@/lib/site';

// Top image of the home page: full-height photograph at 80% opacity over
// black, parallax on scroll, a dark overlay for readability, the intro
// heading with the two calls to action and the slanted white bottom edge.
export default function Hero() {
  return (
    <section className="hero" id="top-section" aria-label="The Art House Victoria Falls">
      <Parallax src={HERO_IMAGE.src} opacity={0.8} priority sizes="100vw" />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content">
        <h1>The Art House – 4-Bedroom Self-Catering House with Pool, Victoria Falls</h1>
        <p>Experience the art of living in Victoria Falls — comfort, nature and unforgettable experiences in your home away from home.</p>
        <div className="hero-actions">
          <a className="btn btn-xl hero-btn" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
            Book Your Stay
          </a>
          <Link className="btn btn-xl hero-btn ghost" href="/about">
            Explore the Art House
          </Link>
        </div>
      </div>
      <Shape position="bottom" />
    </section>
  );
}