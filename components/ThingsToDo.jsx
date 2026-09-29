import Section from './Section';
import CTA from './CTA';
import Link from 'next/link';
import { SITE, THINGS_TO_DO } from '@/lib/site';

export default function ThingsToDo({ limit, headingLevel, intro }) {
  const full = !limit;
  const list = limit ? THINGS_TO_DO.images.slice(0, limit) : THINGS_TO_DO.images;
  return (
    <Section id="things-to-do" title={THINGS_TO_DO.title} headingLevel={headingLevel}>
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
        {list.map((im) => (
          <figure className="ttd-card" key={im.src}>
            <img src={im.src} alt="Victoria Falls experiences" loading="lazy" />
            <figcaption className="ttd-card-cap">
              <span>Victoria Falls</span>
            </figcaption>
          </figure>
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

      {limit ? <CTA href="/things-to-do">See More Experiences</CTA> : null}
    </Section>
  );
}