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
          <span className="eyebrow">Your private home in Victoria Falls</span>
          <h2>Welcome to The Art House</h2>
          <hr />
          <p>
            The Art House is a private four bedroom self-catering house with a swimming pool at 360 Gibson Road, Victoria
            Falls, Zimbabwe, a 35-minute walk from the Falls, sleeping up to 8 guests from US$300 per night.
          </p>
          <p>
            It brings together original art, generous living spaces, a peaceful garden and swimming pool, and a warm,
            personal welcome. Settle in, explore the Falls and enjoy the freedom of a four bedroom self-catering retreat,
            hired out as a whole so it is yours alone.
          </p>
          <Link className="text-link" href="/the-art-house">
            Discover The Art House
          </Link>
        </div>
      </div>
    </section>
  );
}
