import Section from './Section';
import CTA from './CTA';
import Icon from './Icon';
import Stars from './Stars';
import { FEATURED_ARTICLE, REVIEWS, REVIEW_PLATFORMS } from '@/lib/site';
import RatingsStrip from './RatingsStrip';
import SmartImage from './SmartImage';

export default function Reviews({ headingLevel, cta = false }) {
  return (
    <Section id="guest-reviews" title={REVIEWS.title} headingLevel={headingLevel}>
      <p className="section-subtitle">
        Discover what our guests have to say about their experiences at The Art House, Victoria Falls.
      </p>

      {!cta ? <RatingsStrip variant="page" staff /> : null}

      <div className="reviews-grid">
        {REVIEWS.items.map((r) => (
          <figure className="review-card" key={r.name}>
            <blockquote>
              <Icon name="quote-left" className="q" />
              <p>{r.text}</p>
            </blockquote>
            <figcaption className="review-meta">
              {r.image ? (
                <span className="review-photo">
                  <SmartImage src={r.image} alt={`Photo of ${r.name}`} sizes="64px" />
                </span>
              ) : null}
              <span className="review-who">
                <strong>{r.name}</strong>
                <span>{r.role}</span>
              </span>
              <Stars count={r.rating} />
            </figcaption>
          </figure>
        ))}
      </div>

      {!cta ? (
        <div className="review-platforms">
          <h2>More reviews from our guests</h2>
          <ul>
            {REVIEW_PLATFORMS.map((p) => (
              <li key={p.name}>
                <a href={p.href} target="_blank" rel="noopener noreferrer">
                  <strong>{p.name}</strong>
                  <span>{p.note}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!cta ? (
        <p className="featured-in">
          As featured in{' '}
          <a href={FEATURED_ARTICLE.href} target="_blank" rel="noopener noreferrer">
            {FEATURED_ARTICLE.name}
          </a>
        </p>
      ) : null}
      {cta ? <CTA href="/guest-reviews">Read All Reviews</CTA> : null}
    </Section>
  );
}