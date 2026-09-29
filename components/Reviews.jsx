import Section from './Section';
import CTA from './CTA';
import Icon from './Icon';
import Stars from './Stars';
import { REVIEWS, SITE } from '@/lib/site';

export default function Reviews({ headingLevel, cta = false }) {
  return (
    <Section id="guest-reviews" title={REVIEWS.title} headingLevel={headingLevel}>
      <p className="section-subtitle">
        Discover what our guests have to say about their experiences at The Art House, Victoria Falls.
      </p>

      <div className="reviews-grid">
        {REVIEWS.items.map((r) => (
          <figure className="review-card" key={r.name}>
            <blockquote>
              <Icon name="quote-left" className="q" />
              <p>{r.text}</p>
            </blockquote>
            <figcaption className="review-meta">
              <span className="review-photo">
                <img src={r.image} alt="" loading="lazy" />
              </span>
              <span className="review-who">
                <strong>{r.name}</strong>
                <span>{r.role}</span>
              </span>
              <Stars count={r.rating} />
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="section-cta row">
        <a className="btn btn-xl" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
          Book Your Stay
        </a>
      </div>
      {cta ? <CTA href="/guest-reviews">Read All Reviews</CTA> : null}
    </Section>
  );
}