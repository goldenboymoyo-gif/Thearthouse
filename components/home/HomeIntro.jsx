import Link from 'next/link';
import SmartImage from '../SmartImage';
import { img } from '@/lib/assets';

// Short welcome: one photograph and two sentences, then on to the full story.
export default function HomeIntro() {
  return (
    <section className="s-module alt home-intro">
      <div className="container home-intro-grid">
        <div className="home-intro-media" data-aos="fade-up">
          <SmartImage
            src={img('2000_6298ddadb801c.jpg')}
            alt="The Art House veranda and rolling lawn, Victoria Falls"
            sizes="(max-width: 767px) 92vw, 50vw"
          />
        </div>
        <div className="home-intro-text" data-aos="fade-up">
          <span className="eyebrow">Welcome to The Art House</span>
          <h2>A private family home in the heart of Victoria Falls</h2>
          <hr />
          <p>
            Set in large, lush gardens in the original quiet suburb of Victoria Falls, The Art House is hired out as a whole
            unit, so the house, the swimming pool and the gardens are yours alone.
          </p>
          <p>
            Adorned with paintings by renowned African artists, it is within easy walking distance of the town centre and the
            magnificent waterfall.
          </p>
          <Link className="text-link" href="/the-art-house">
            Discover The Art House <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
