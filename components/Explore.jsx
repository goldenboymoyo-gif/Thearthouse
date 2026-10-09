import Link from 'next/link';
import Section from './Section';
import SmartImage from './SmartImage';
import { AROUND, SITE, THINGS_TO_DO } from '@/lib/site';

// One combined "Explore" section: the Falls on our doorstep, the activities we
// can book for guests, and local food & entertainment – no repeated content.
// The three Explore blocks, in order (edited in the admin dashboard).
const [falls, tours, food] = AROUND.items;

export default function Explore({ headingLevel = 'h1' }) {
  return (
    <Section id="explore" title="Explore Victoria Falls" headingLevel={headingLevel}>
      <div className="around-intro">
        <div className="around-intro-text">
          <h2 className="explore-sub">{falls.title}</h2>
          {falls.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="around-intro-media">
          <SmartImage src={falls.image} alt={falls.title} sizes="(max-width: 767px) 92vw, 46vw" />
        </div>
      </div>

      <div id="things-to-do" className="explore-block">
        <div className="ttd-intro">
          <h2 className="explore-sub">{tours.title}</h2>
          {tours.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="ttd-grid">
          {THINGS_TO_DO.activities.map((a) => (
            <Link className="ttd-card" href={`/things-to-do/${a.slug}`} key={a.slug}>
              <figure className="ttd-media">
                <SmartImage src={a.image} alt={a.title} sizes="(max-width: 767px) 92vw, 30vw" />
              </figure>
              <span className="ttd-card-body">
                <span className="ttd-card-title">{a.title}</span>
                <span className="ttd-card-hint">{a.tagline}</span>
                <span className="ttd-card-more" aria-hidden="true">
                  Learn More <span className="ttd-arrow">&rarr;</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div id="food-and-entertainment" className="around-list explore-block">
        <article className="around-item reversed">
          <div className="around-media">
            <SmartImage src={food.image} alt={food.title} sizes="(max-width: 767px) 92vw, 46vw" />
          </div>
          <div className="around-content">
            <h3>{food.title}</h3>
            {food.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="around-actions">
              <Link className="btn btn-sm" href="/contact">
                Ask Us for Recommendations
              </Link>
            </div>
          </div>
        </article>
      </div>

      <div className="ttd-cta">
        <p>Tell us what you&apos;d like to see and do, we&apos;ll book your tours, activities and transfers at no additional cost.</p>
        <div className="around-actions">
          <Link className="btn btn-xl" href="/contact">
            Enquire About Activities
          </Link>
          <a className="btn btn-xl btn-outline" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
            Book Your Stay
          </a>
        </div>
      </div>
    </Section>
  );
}
