import Section from './Section';
import CTA from './CTA';
import Link from 'next/link';
import { SITE, THINGS_TO_DO } from '@/lib/site';
import SmartImage from './SmartImage';

export default function ThingsToDo({ limit, headingLevel, intro, alt = false }) {
  const full = !limit;
  const list = limit ? THINGS_TO_DO.activities.slice(0, limit) : THINGS_TO_DO.activities;
  return (
    <Section id="things-to-do" title={THINGS_TO_DO.title} alt={alt} headingLevel={headingLevel}>
      {full ? (
        <div className="ttd-intro">
          <h3>Unforgettable Experiences in Victoria Falls</h3>
          <p>
            Explore the adventures, natural wonders and local experiences that make Victoria Falls an unforgettable
            destination. Let us help you plan your stay.
          </p>
        </div>
      ) : null}
      {intro ? <p className="intro-text">{intro}</p> : null}

      <div className="ttd-grid">
        {list.map((a) => (
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

      {full ? (
        <div className="ttd-cta">
          <p>
            Victoria Falls is known as the adventure capital of Africa. We offer a comprehensive and highly personalised
            activity booking service and can assist with holiday planning, tours, activities and transfers at no
            additional cost.
          </p>
          <div className="around-actions">
            <Link className="btn btn-xl" href="/contact">
              Enquire About Activities
            </Link>
            <a className="btn btn-xl btn-outline" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
              Book Your Stay
            </a>
          </div>
        </div>
      ) : null}

      {limit ? <CTA href="/explore#things-to-do">See More Experiences</CTA> : null}
    </Section>
  );
}