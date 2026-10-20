import Link from 'next/link';
import SmartImage from '../SmartImage';
import { img } from '@/lib/assets';
import { RATINGS } from '@/lib/site';

// Hospitality: "A personal Victoria Falls welcome".
export default function HomeWelcome() {
  return (
    <section className="s-module home-welcome">
      <div className="container home-intro-grid">
        <div className="home-intro-text" data-aos="fade-up">
          <span className="eyebrow">Hospitality</span>
          <h2>A personal Victoria Falls welcome</h2>
          <hr />
          <p>
            A memorable stay is about more than beautiful accommodation. You are welcomed in person, the house is serviced
            daily by friendly and discreet staff, and we share our local knowledge freely: where to eat, what to see and
            when to go.
          </p>
          <p>
            We gladly arrange your tours, activities and transfers, with no booking fee, so you can simply settle in and
            enjoy Victoria Falls.
          </p>
          <p className="welcome-score">
            <a href={RATINGS.booking.url} target="_blank" rel="noopener noreferrer">
              <strong>{RATINGS.booking.staff}</strong> for Staff on Booking.com
            </a>{' '}
            <span>(as of {RATINGS.asOf})</span>
          </p>
          <Link className="text-link" href="/explore">
            See what we can arrange
          </Link>
        </div>
        <div className="home-intro-media" data-aos="fade-up">
          <SmartImage
            src={img('ah-2990.jpg')}
            alt="Outdoor dining table on the patio at The Art House"
            sizes="(max-width: 767px) 92vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
