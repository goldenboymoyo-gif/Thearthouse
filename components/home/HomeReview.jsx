import Link from 'next/link';
import Stars from '../Stars';
import { REVIEWS } from '@/lib/site';

// One guest's words, large — with a link to the rest.
export default function HomeReview() {
  const r = REVIEWS.items[2];
  return (
    <section className="s-module home-review">
      <div className="container" data-aos="fade-up">
        <figure className="big-quote">
          <span className="big-quote-mark" aria-hidden="true">“</span>
          <blockquote>{r.text}</blockquote>
          <figcaption>
            <Stars count={r.rating} />
            <strong>{r.name}</strong>
            <span>{r.role}</span>
          </figcaption>
        </figure>
        <div className="section-cta">
          <Link className="text-link" href="/guest-reviews">
            Read what our guests say <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
